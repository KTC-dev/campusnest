import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SettingsSection } from "@/components/Settings/SettingsSection";
import { SettingsRow } from "@/components/Settings/SettingsRow";
import { ToggleRow } from "@/components/Settings/ToggleRow";
import { useAuthStore } from "@/store/authStore";
import { preferencesService } from "@/services/preferences.service";
import { useToastStore } from "@/store/toastStore";
import { ActiveSessionsModal } from "@/components/Settings/ActiveSessionsModal";

export default function SettingsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);

    // load existing preferences
    const { data: prefs } = useQuery({ queryKey: ["preferences", "notifications"], queryFn: preferencesService.getNotifications, retry: false });

    const [emailNotifications, setEmailNotifications] = useState<boolean>(prefs?.email ?? true);
    const [pushNotifications, setPushNotifications] = useState<boolean>(prefs?.push ?? false);
    const [inAppNotifications, setInAppNotifications] = useState<boolean>(prefs?.inApp ?? true);
    const [twoFactor, setTwoFactor] = useState(false);
    const addToast = useToastStore((s) => s.addToast);
    const [showSessions, setShowSessions] = useState(false);

    // mutation
    const mutation = useMutation({
        mutationFn: preferencesService.updateNotifications, onSuccess: (data) => {
            queryClient.setQueryData(["preferences", "notifications"], data);
        }
    });

    return (
        <div className="page-enter space-y-6 p-4 pb-28">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">{user?.email?.[0]?.toUpperCase()}</div>
                <div>
                    <p className="text-sm font-semibold text-text.primary">{user?.email}</p>
                    <p className="text-xs text-text.secondary">{user?.role?.toLowerCase()}</p>
                </div>
            </div>

            <Card variant="strong" padding="md" className="border border-border/60">
                <SettingsSection title="Account">
                    <SettingsRow title="Edit profile" subtitle="Name, contact & business" onClick={() => navigate('/profile')} />
                    <SettingsRow title="Linked accounts" subtitle="Google, Apple" onClick={() => addToast({ type: 'info', title: 'Coming soon', message: 'Google and Apple sign-in will be available soon.' })} />
                    <SettingsRow title="Language" subtitle="English (US)" onClick={() => addToast({ type: 'info', title: 'Coming soon', message: 'Language selection will be available soon.' })} />
                </SettingsSection>
            </Card>

            <Card variant="strong" padding="md" className="border border-border/60">
                <SettingsSection title="Notifications">
                    <ToggleRow label="In-app messages" description="Show new message badges" checked={inAppNotifications} onChange={(v) => { setInAppNotifications(v); mutation.mutate({ inApp: v }); }} />
                    <ToggleRow label="Email" description="Receive email updates" checked={emailNotifications} onChange={(v) => { setEmailNotifications(v); mutation.mutate({ email: v }); }} />
                    <ToggleRow label="Push" description="Enable push notifications" checked={pushNotifications} onChange={(v) => { setPushNotifications(v); mutation.mutate({ push: v }); }} />
                    <div className="px-4 py-2 text-xs text-text.secondary">
                        Security notifications (alerts, account warnings) cannot be disabled and will always be delivered.
                    </div>
                </SettingsSection>
            </Card>

            <Card variant="strong" padding="md" className="border border-border/60">
                <SettingsSection title="Appearance">
                    <SettingsRow title="Theme" subtitle="System / Light / Dark" onClick={() => addToast({ type: 'info', title: 'Coming soon', message: 'Theme selection will be available soon.' })} />
                </SettingsSection>
            </Card>

            <Card variant="strong" padding="md" className="border border-border/60">
                <SettingsSection title="Privacy & Security">
                    <SettingsRow title="Change password" onClick={() => addToast({ type: 'info', title: 'Contact support', message: 'Password changes require email verification. Please contact support to update your password.' })} />
                    <ToggleRow label="Two‑factor authentication" description="Add an extra layer of security" checked={twoFactor} onChange={(v) => { setTwoFactor(v); addToast({ type: 'info', title: 'Two-factor', message: v ? 'Enabled (demo)' : 'Disabled (demo)' }); }} />
                    <SettingsRow title="Active sessions" subtitle="Sign out other devices" onClick={() => setShowSessions(true)} />
                </SettingsSection>
            </Card>

            <Card variant="strong" padding="md" className="border border-border/60">
                <SettingsSection title="Support">
                    <SettingsRow title="Help center" onClick={() => navigate('/help')} />
                    <SettingsRow title="Contact support" onClick={() => navigate('/contact')} />
                </SettingsSection>
            </Card>

            <Card variant="strong" padding="md" className="border border-border/60">
                <SettingsSection title="Legal">
                    <SettingsRow title="Privacy policy" onClick={() => navigate('/privacy')} />
                    <SettingsRow title="Terms of service" onClick={() => navigate('/terms')} />
                </SettingsSection>
            </Card>

            <Card variant="strong" padding="md" className="border border-border/60">
                <SettingsSection title="About">
                    <SettingsRow title="About Edurus" subtitle="Version 0.1.0" onClick={() => navigate('/about')} />
                </SettingsSection>
            </Card>

            <div className="mx-auto max-w-md">
                <Button variant="danger" size="md" fullWidth onClick={() => {
                    // perform logout
                    queryClient.clear();
                    window.location.href = '/';
                }}>
                    Log out
                </Button>
            </div>
            {showSessions && <ActiveSessionsModal onClose={() => setShowSessions(false)} />}
        </div>
    );
}

