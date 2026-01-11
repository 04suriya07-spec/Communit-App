import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Auth() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regDisplayName, setRegDisplayName] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.login({ email: loginEmail, password: loginPassword });
            toast({ title: "Welcome back!", description: "Logged in successfully." });
            window.location.href = "/";
        } catch (error) {
            toast({ title: "Login failed", description: (error as Error).message, variant: 'destructive' });
        } finally { setIsLoading(false); }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.register({ email: regEmail, password: regPassword, initialDisplayName: regDisplayName });
            toast({ title: "Account created!", description: "Welcome!" });
            window.location.href = "/";
        } catch (error) {
            toast({ title: "Registration failed", description: (error as Error).message, variant: 'destructive' });
        } finally { setIsLoading(false); }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
                    <CardDescription>Sign in or create account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2"><Label>Email</Label><Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required /></div>
                                <div className="space-y-2"><Label>Password</Label><Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required /></div>
                                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Loading..." : "Login"}</Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2"><Label>Email</Label><Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required /></div>
                                <div className="space-y-2"><Label>Display Name</Label><Input value={regDisplayName} onChange={e => setRegDisplayName(e.target.value)} required /></div>
                                <div className="space-y-2"><Label>Password</Label><Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required /></div>
                                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Creating..." : "Create Account"}</Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
