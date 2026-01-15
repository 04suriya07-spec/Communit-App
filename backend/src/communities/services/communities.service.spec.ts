import { Test, TestingModule } from '@nestjs/testing';
import { CommunitiesService } from './communities.service';
import { CommunityRepository } from '../repositories/community.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityType, MemberRole } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CommunitiesService', () => {
    let service: CommunitiesService;
    let communityRepo: jest.Mocked<CommunityRepository>;
    let memberRepo: jest.Mocked<CommunityMemberRepository>;

    const mockCommunity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-community',
        name: 'Test Community',
        description: 'A test community',
        type: CommunityType.public_open,
        creatorId: 'user-123',
        avatarUrl: null,
        bannerUrl: null,
        isSearchable: true,
        memberCount: 1,
        followerCount: 0,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    beforeEach(async () => {
        const mockCommunityRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            findBySlug: jest.fn(),
            list: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            incrementMemberCount: jest.fn(),
            decrementMemberCount: jest.fn(),
            incrementFollowerCount: jest.fn(),
            decrementFollowerCount: jest.fn(),
        };

        const mockMemberRepo = {
            create: jest.fn(),
            findByCommunityAndUser: jest.fn(),
            findByCommunity: jest.fn(),
            getUserRole: jest.fn(),
            updateRole: jest.fn(),
            remove: jest.fn(),
            isMember: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommunitiesService,
                {
                    provide: CommunityRepository,
                    useValue: mockCommunityRepo,
                },
                {
                    provide: CommunityMemberRepository,
                    useValue: mockMemberRepo,
                },
            ],
        }).compile();

        service = module.get<CommunitiesService>(CommunitiesService);
        communityRepo = module.get(CommunityRepository);
        memberRepo = module.get(CommunityMemberRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a community and assign creator as owner', async () => {
            const dto = {
                name: 'Test Community',
                description: 'A test community',
                type: CommunityType.public_open,
            };

            communityRepo.findBySlug.mockResolvedValue(null);
            communityRepo.create.mockResolvedValue(mockCommunity);
            memberRepo.create.mockResolvedValue({
                id: 'member-123',
                communityId: mockCommunity.id,
                userId: 'user-123',
                role: MemberRole.owner,
                joinedAt: new Date(),
                invitedBy: null,
                metadata: {},
            });

            const result = await service.create(dto, 'user-123');

            expect(communityRepo.findBySlug).toHaveBeenCalled();
            expect(communityRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: dto.name,
                    type: dto.type,
                    creatorId: 'user-123',
                }),
            );
            expect(memberRepo.create).toHaveBeenCalledWith({
                communityId: mockCommunity.id,
                userId: 'user-123',
                role: MemberRole.owner,
            });
            expect(result.userRole).toBe(MemberRole.owner);
        });

        it('should throw ConflictException if slug already exists', async () => {
            const dto = {
                name: 'Test Community',
                type: CommunityType.public_open,
                slug: 'existing-slug',
            };

            communityRepo.findBySlug.mockResolvedValue(mockCommunity);

            await expect(service.create(dto, 'user-123')).rejects.toThrow(
                ConflictException,
            );
        });

        it('should generate slug from name if not provided', async () => {
            const dto = {
                name: 'My Awesome Community!',
                type: CommunityType.public_open,
            };

            communityRepo.findBySlug.mockResolvedValue(null);
            communityRepo.create.mockResolvedValue(mockCommunity);
            memberRepo.create.mockResolvedValue({} as any);

            await service.create(dto, 'user-123');

            expect(communityRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    slug: 'my-awesome-community',
                }),
            );
        });
    });

    describe('getById', () => {
        it('should return community for public_open type', async () => {
            communityRepo.findById.mockResolvedValue(mockCommunity);
            memberRepo.getUserRole.mockResolvedValue(null);

            const result = await service.getById(mockCommunity.id);

            expect(result.id).toBe(mockCommunity.id);
            expect(result.name).toBe(mockCommunity.name);
        });

        it('should throw NotFoundException for non-existent community', async () => {
            communityRepo.findById.mockResolvedValue(null);

            await expect(service.getById('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw NotFoundException for private community when user is not member', async () => {
            const privateCommunity = {
                ...mockCommunity,
                type: CommunityType.private,
            };

            communityRepo.findById.mockResolvedValue(privateCommunity);
            memberRepo.isMember.mockResolvedValue(false);

            await expect(service.getById(privateCommunity.id, 'user-456')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return private community when user is member', async () => {
            const privateCommunity = {
                ...mockCommunity,
                type: CommunityType.private,
            };

            communityRepo.findById.mockResolvedValue(privateCommunity);
            memberRepo.isMember.mockResolvedValue(true);
            memberRepo.getUserRole.mockResolvedValue(MemberRole.member);

            const result = await service.getById(privateCommunity.id, 'user-123');

            expect(result.id).toBe(privateCommunity.id);
            expect(result.userRole).toBe(MemberRole.member);
        });
    });

    describe('list', () => {
        it('should list communities with pagination', async () => {
            communityRepo.list.mockResolvedValue({
                communities: [mockCommunity],
                total: 1,
                hasMore: false,
            });
            memberRepo.getUserRole.mockResolvedValue(null);

            const result = await service.list({ limit: 20 });

            expect(result.communities).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.hasMore).toBe(false);
        });

        it('should filter private communities for non-members', async () => {
            const privateCommunity = {
                ...mockCommunity,
                type: CommunityType.private,
            };

            communityRepo.list.mockResolvedValue({
                communities: [mockCommunity, privateCommunity],
                total: 2,
                hasMore: false,
            });
            memberRepo.isMember.mockResolvedValue(false);
            memberRepo.getUserRole.mockResolvedValue(null);

            const result = await service.list({ limit: 20 }, 'user-456');

            // Should only include public_open community
            expect(result.communities).toHaveLength(1);
            expect(result.communities[0].type).toBe(CommunityType.public_open);
        });
    });
});
