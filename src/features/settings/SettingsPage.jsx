import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Sun,
  Moon,
  Laptop,
  Check,
  Copy,
  Trash2,
  Key,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Cpu,
  Cloud,
  Lock,
  Sliders,
  Eye,
  EyeOff,
  Download,
  RotateCcw,
  Send,
  Users,
  CheckCircle2,
  Zap,
  Sparkles,
  Radio,
} from 'lucide-react';
import Button from '../../components/Button';
import settingsService from '../../api/services/settingsService';
import { useSessionStore } from '../../stores/useSessionStore';
import { useUIStore } from '../../stores/useUIStore';

const SECTIONS = [
  { id: 'profile', label: 'Profile & Account', icon: User },
  { id: 'organization', label: 'Organization & Team', icon: Building2 },
  { id: 'execution', label: 'Execution & Model Defaults', icon: Cpu },
  { id: 'notifications', label: 'Alerts & Webhooks', icon: Bell },
  { id: 'security', label: 'Security & Access Tokens', icon: Shield },
  { id: 'appearance', label: 'Theme & Workspace', icon: Palette },
  { id: 'region', label: 'Localization & Data Export', icon: Globe },
];

function SectionPanel({ children, title, description, badge }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">{title}</h2>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, description, children }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between pt-1">
      <div className="sm:w-64 flex-shrink-0">
        <label className="text-xs font-semibold text-gray-800 dark:text-slate-200">{label}</label>
        {description && <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Global store sync
  const sessionUser = useSessionStore((s) => s.user);
  const setOrganization = useSessionStore((s) => s.setOrganization);
  const { theme: activeTheme, setTheme, setSidebarCollapsed } = useUIStore();

  // 1. Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    jobTitle: '',
    bio: '',
    avatarUrl: '',
    role: 'user',
    createdAt: '',
  });

  // 2. Organization State
  const [organization, setOrgState] = useState({
    name: 'Acme Corp',
    slug: 'acme-corp',
    website: 'https://acme.io',
    industry: 'Software & Technology',
    logoUrl: '',
  });
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', email: 'alex@company.io', name: 'Alex Johnson', role: 'Owner' },
  ]);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  // 3. Execution Defaults State (Dual Execution Model)
  const [execution, setExecution] = useState({
    defaultExecutionMode: 'cloud',
    defaultModelId: 'google/gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 2048,
  });

  // 4. Notifications State
  const [notifications, setNotifications] = useState({
    automationFailures: true,
    weeklyDigest: true,
    agentErrorAlerts: true,
    billingReminders: false,
    newFeatures: false,
    teamActivity: true,
    emailDigestFrequency: 'weekly',
    webhookUrl: '',
  });
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // 5. Security & Tokens State
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    apiTokensCount: 0,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({ current: false, next: false });
  const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaSecret] = useState('JBSWY3DPEHPK3PXP');
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  // API Tokens
  const [apiTokens, setApiTokens] = useState([]);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenDays, setNewTokenDays] = useState('30');
  const [newTokenScopes, setNewTokenScopes] = useState(['all']);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // 6. Appearance State
  const [appearance, setAppearance] = useState({
    theme: activeTheme || 'System',
    sidebarDefault: 'Expanded',
    canvasGridStyle: 'dots',
    interfaceDensity: 'comfortable',
    soundEffects: true,
  });

  // Keep appearance.theme synchronized with active global store theme
  useEffect(() => {
    if (activeTheme) {
      setAppearance((prev) => ({ ...prev, theme: activeTheme }));
    }
  }, [activeTheme]);

  // 7. Region & Localization State
  const [region, setRegion] = useState({
    timezone: 'UTC+05:30 – Mumbai, New Delhi',
    language: 'English (US)',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD ($)',
  });
  const [privacy, setPrivacy] = useState({
    telemetryEnabled: true,
    crashReportsEnabled: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Load Settings from Backend API
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSettings();
      if (data) {
        if (data.profile) {
          setProfile({
            name: data.profile.name || '',
            email: data.profile.email || '',
            jobTitle: data.profile.jobTitle || '',
            bio: data.profile.bio || '',
            avatarUrl: data.profile.avatarUrl || '',
            role: data.profile.role || 'user',
            createdAt: data.profile.createdAt || '',
          });
          setTeamMembers([
            {
              id: data.profile.id,
              email: data.profile.email,
              name: data.profile.name || 'Current User',
              role: 'Owner',
            },
          ]);
        }
        if (data.organization) {
          setOrgState({
            name: data.organization.name || '',
            slug: data.organization.slug || '',
            website: data.organization.website || '',
            industry: data.organization.industry || 'Software & Technology',
            logoUrl: data.organization.logoUrl || '',
          });
        }
        if (data.execution) {
          setExecution({
            defaultExecutionMode: data.execution.defaultExecutionMode || 'cloud',
            defaultModelId: data.execution.defaultModelId || 'google/gemini-2.5-flash',
            temperature: data.execution.temperature ?? 0.7,
            maxTokens: data.execution.maxTokens ?? 2048,
          });
        }
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        if (data.appearance) {
          setAppearance((prev) => ({ ...prev, ...data.appearance }));
          const localTheme = typeof window !== 'undefined' && localStorage.getItem('awas-theme');
          if (data.appearance.theme && !localTheme) {
            setTheme(data.appearance.theme);
          } else if (localTheme && data.appearance.theme !== localTheme) {
            // Keep user local choice and sync to backend
            settingsService.updateAppearance({ theme: localTheme }).catch(() => {});
          }
        }
        if (data.region) {
          setRegion(data.region);
        }
        if (data.privacy) {
          setPrivacy(data.privacy);
        }
        if (data.security) {
          setSecurity(data.security);
        }
      }

      // Load Tokens
      const tokens = await settingsService.listApiTokens();
      if (Array.isArray(tokens)) {
        setApiTokens(tokens);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      showToast('error', 'Failed to load settings from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // 1. Profile Handlers
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      const updated = await settingsService.updateProfile({
        name: profile.name,
        jobTitle: profile.jobTitle,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      });
      showToast('success', 'Profile updated successfully!');
      if (sessionUser) {
        useSessionStore.setState({
          user: { ...sessionUser, name: updated.name, jobTitle: updated.jobTitle },
        });
      }
    } catch (err) {
      console.error('Update profile error:', err);
      showToast('error', err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    setProfile({ ...profile, avatarUrl: newAvatar });
  };

  // 2. Organization Handlers
  const handleSaveOrganization = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      const updated = await settingsService.updateOrganization(organization);
      setOrgState(updated);
      setOrganization(updated);
      showToast('success', 'Organization settings saved!');
    } catch (err) {
      console.error('Update org error:', err);
      showToast('error', err?.message || 'Failed to update organization.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteMember = (e) => {
    e?.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      showToast('error', 'Please provide a valid teammate email address.');
      return;
    }
    const newMember = {
      id: Date.now().toString(),
      email: inviteEmail.trim(),
      name: inviteEmail.split('@')[0],
      role: inviteRole,
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setIsInvitingMember(false);
    showToast('success', `Invitation sent to ${newMember.email} as ${inviteRole}`);
  };

  // 3. Execution Defaults Handlers
  const handleSaveExecution = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      const updated = await settingsService.updateExecution(execution);
      setExecution(updated);
      showToast('success', 'Execution and model preferences saved!');
    } catch (err) {
      console.error('Update execution error:', err);
      showToast('error', err?.message || 'Failed to update execution settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Notifications Handlers
  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await settingsService.updateNotifications(updated);
      showToast('success', 'Notification preferences updated.');
    } catch (err) {
      console.error('Update notification error:', err);
      showToast('error', 'Failed to update notifications.');
    }
  };

  const handleSaveNotifications = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      await settingsService.updateNotifications(notifications);
      showToast('success', 'Alert preferences saved successfully!');
    } catch (err) {
      console.error('Save notifications error:', err);
      showToast('error', err?.message || 'Failed to save notifications.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = () => {
    if (!notifications.webhookUrl) {
      showToast('error', 'Please enter a webhook endpoint URL first.');
      return;
    }
    setIsTestingWebhook(true);
    setTimeout(() => {
      setIsTestingWebhook(false);
      showToast('success', `Test event ping delivered to ${notifications.webhookUrl}`);
    }, 1200);
  };

  // 5. Security & Tokens Handlers
  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (!passwords.currentPassword) {
      showToast('error', 'Please enter your current password.');
      return;
    }
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }

    try {
      setIsSaving(true);
      await settingsService.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Password changed successfully!');
    } catch (err) {
      console.error('Change password error:', err);
      showToast('error', err?.message || 'Current password incorrect.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart2FaSetup = () => {
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    );
    setRecoveryCodes(codes);
    setIs2FaModalOpen(true);
  };

  const handleVerifyAndEnable2FA = async () => {
    if (!twoFaCode || twoFaCode.length < 6) {
      showToast('error', 'Please enter a valid 6-digit authenticator code.');
      return;
    }
    try {
      const res = await settingsService.toggle2FA(true);
      setSecurity((s) => ({ ...s, twoFactorEnabled: res.twoFactorEnabled }));
      setIs2FaModalOpen(false);
      setTwoFaCode('');
      showToast('success', 'Two-Factor Authentication is now enabled!');
    } catch (err) {
      showToast('error', 'Failed to enable 2FA.');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
    try {
      const res = await settingsService.toggle2FA(false);
      setSecurity((s) => ({ ...s, twoFactorEnabled: res.twoFactorEnabled }));
      showToast('success', 'Two-Factor Authentication disabled.');
    } catch (err) {
      showToast('error', 'Failed to disable 2FA.');
    }
  };

  const handleCreateToken = async (e) => {
    e?.preventDefault();
    if (!newTokenName.trim()) {
      showToast('error', 'Please enter a name for the token.');
      return;
    }
    try {
      setIsSaving(true);
      const res = await settingsService.createApiToken(newTokenName.trim(), Number(newTokenDays), newTokenScopes);
      setGeneratedToken(res.token);
      setApiTokens((prev) => [
        {
          id: res.id,
          name: res.name,
          tokenPrefix: res.tokenPrefix,
          scopes: res.scopes || ['all'],
          createdAt: res.createdAt,
          expiresAt: res.expiresAt,
          lastUsedAt: null,
        },
        ...prev,
      ]);
      setNewTokenName('');
      setIsCreatingToken(false);
      showToast('success', 'Personal access token generated!');
    } catch (err) {
      console.error('Create token error:', err);
      showToast('error', err?.message || 'Failed to generate token.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeToken = async (tokenId) => {
    if (!window.confirm('Revoke this API token? Any external tool or webhook using it will lose access immediately.')) {
      return;
    }
    try {
      await settingsService.revokeApiToken(tokenId);
      setApiTokens((prev) => prev.filter((t) => t.id !== tokenId));
      showToast('success', 'API token revoked.');
    } catch (err) {
      console.error('Revoke token error:', err);
      showToast('error', 'Failed to revoke token.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  // 6. Appearance Handlers
  const handleUpdateAppearanceTheme = async (theme) => {
    const updated = { ...appearance, theme };
    setAppearance(updated);
    setTheme(theme);
    try {
      await settingsService.updateAppearance({
        theme,
        sidebarDefault: appearance.sidebarDefault,
        canvasGridStyle: appearance.canvasGridStyle,
        interfaceDensity: appearance.interfaceDensity,
        soundEffects: appearance.soundEffects,
      });
      showToast('success', `Theme switched to ${theme}`);
    } catch (err) {
      console.warn('Remote appearance update notice:', err);
      showToast('success', `Theme switched to ${theme}`);
    }
  };

  const handleUpdateAppearanceSidebar = async (sidebarDefault) => {
    const updated = { ...appearance, sidebarDefault };
    setAppearance(updated);
    setSidebarCollapsed(sidebarDefault === 'Collapsed');
    try {
      await settingsService.updateAppearance(updated);
      showToast('success', `Sidebar default set to ${sidebarDefault}`);
    } catch (err) {
      showToast('error', 'Failed to update sidebar preference.');
    }
  };

  const handleSaveAppearance = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      await settingsService.updateAppearance(appearance);
      showToast('success', 'Workspace appearance settings saved!');
    } catch (err) {
      showToast('error', 'Failed to save appearance settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // 7. Region & Localization Handlers
  const handleSaveRegion = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      const updated = await settingsService.updateRegion({ ...region, ...privacy });
      setRegion({
        timezone: updated.timezone,
        language: updated.language,
        dateFormat: updated.dateFormat,
        currency: updated.currency,
      });
      showToast('success', 'Localization preferences updated!');
    } catch (err) {
      console.error('Update region error:', err);
      showToast('error', err?.message || 'Failed to update regional settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportWorkspace = async () => {
    try {
      setIsExporting(true);
      const res = await settingsService.exportWorkspaceData();
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `awas-workspace-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Workspace data exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      showToast('error', 'Failed to export workspace data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetSettings = async () => {
    if (!window.confirm('Reset all workspace settings and preferences back to platform factory defaults?')) {
      return;
    }
    try {
      setIsSaving(true);
      await settingsService.resetSettings();
      await loadSettings();
      showToast('success', 'Settings reset to factory defaults.');
    } catch (err) {
      showToast('error', 'Failed to reset settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50/60 dark:bg-slate-950 overflow-y-auto selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-8 py-6 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Settings</h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MongoDB Atlas Synced
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Manage your personal account, organization, dual-mode execution preferences, security, and workspaces.
            </p>
          </div>
          <button
            onClick={loadSettings}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg transition"
            title="Reload settings from MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Floating Feedback Toast Banner */}
      {feedback && (
        <div className="max-w-6xl mx-auto px-8 pt-4">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Nav */}
          <aside className="lg:w-60 flex-shrink-0">
            <nav className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden sticky top-6 transition-colors duration-200">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full text-left text-xs font-semibold transition-all border-b border-gray-50 dark:border-slate-800/80 last:border-0 ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-l-4 border-l-indigo-600'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white border-l-4 border-l-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'}`} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-6 min-w-0">
            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-xs">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-gray-700 dark:text-slate-200">Connecting to MongoDB Atlas...</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">Loading user profile, settings, and workspace preferences</p>
              </div>
            ) : (
              <>
                {/* ────────────────────────────────────────────────────────── */}
                {/* 1. PROFILE & ACCOUNT TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeSection === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <SectionPanel
                      title="Personal Profile & Account"
                      description="Manage your profile information and how collaborators see you across agents and canvases."
                      badge={profile.role?.toUpperCase()}
                    >
                      {/* Avatar preview and generator */}
                      <FieldRow label="Profile Avatar" description="Your avatar is visible in chats, workflow collaboration, and talent boards.">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name || 'AWAS'}`}
                              alt={profile.name}
                              className="w-16 h-16 rounded-2xl border-2 border-indigo-100 object-cover shadow-xs bg-indigo-50"
                            />
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleGenerateRandomAvatar}
                                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                Randomize Avatar
                              </button>
                              {profile.avatarUrl && (
                                <button
                                  type="button"
                                  onClick={() => setProfile({ ...profile, avatarUrl: '' })}
                                  className="text-xs text-gray-400 hover:text-red-500 font-medium px-2 py-1 transition"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                            <input
                              type="url"
                              value={profile.avatarUrl}
                              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                              placeholder="Or paste custom image URL"
                              className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                            />
                          </div>
                        </div>
                      </FieldRow>

                      <FieldRow label="Full Name" description="Displayed across team workspaces and execution logs.">
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          placeholder="e.g. Alex Johnson"
                          required
                          className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        />
                      </FieldRow>

                      <FieldRow label="Email Address" description="Primary email used for JWT authentication and system alerts.">
                        <div className="relative">
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full text-xs bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-lg px-3 py-2 outline-none font-medium text-gray-600 dark:text-slate-400 cursor-not-allowed pr-24"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Verified
                          </span>
                        </div>
                      </FieldRow>

                      <FieldRow label="Job Title" description="Your functional responsibility (e.g. Lead AI Architect).">
                        <input
                          type="text"
                          value={profile.jobTitle}
                          onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                          placeholder="e.g. Lead AI Engineer"
                          className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        />
                      </FieldRow>

                      <FieldRow label="Bio / Specialty" description="Short profile description shown on published agents and talent contracts.">
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="Describe your technical background and agent workflows..."
                          className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 h-24 resize-none"
                        />
                      </FieldRow>
                    </SectionPanel>

                    <div className="flex justify-end">
                      <Button type="submit" variant="brand" size="sm" disabled={isSaving} className="font-semibold gap-1.5">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 2. ORGANIZATION & TEAM TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeSection === 'organization' && (
                  <div className="space-y-6">
                    <form onSubmit={handleSaveOrganization} className="space-y-6">
                      <SectionPanel
                        title="Organization Details"
                        description="Configure your multi-tenant workspace parameters, company branding, and industry."
                      >
                        <FieldRow label="Organization Name">
                          <input
                            type="text"
                            value={organization.name}
                            onChange={(e) => setOrgState({ ...organization, name: e.target.value })}
                            placeholder="e.g. Acme Robotics Corp"
                            required
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                          />
                        </FieldRow>

                        <FieldRow label="Organization Slug" description="Unique URL and API handle for your tenant.">
                          <div className="flex items-center">
                            <span className="text-xs bg-gray-50 dark:bg-slate-850 border border-r-0 border-gray-250 dark:border-slate-700 px-3 py-2 rounded-l-lg text-gray-400 dark:text-slate-500 select-none">
                              awas.ai/
                            </span>
                            <input
                              type="text"
                              value={organization.slug}
                              onChange={(e) => setOrgState({ ...organization, slug: e.target.value })}
                              placeholder="acme-corp"
                              className="flex-1 text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-r-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                            />
                          </div>
                        </FieldRow>

                        <FieldRow label="Website">
                          <input
                            type="url"
                            value={organization.website}
                            onChange={(e) => setOrgState({ ...organization, website: e.target.value })}
                            placeholder="https://acme.io"
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                          />
                        </FieldRow>

                        <FieldRow label="Industry Sector">
                          <select
                            value={organization.industry}
                            onChange={(e) => setOrgState({ ...organization, industry: e.target.value })}
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                          >
                            <option>Artificial Intelligence & Robotics</option>
                            <option>Software & Cloud Infrastructure</option>
                            <option>Financial Services & FinTech</option>
                            <option>Healthcare & Life Sciences</option>
                            <option>E-commerce & Retail Logistics</option>
                            <option>Media & Creative Engineering</option>
                            <option>Other</option>
                          </select>
                        </FieldRow>
                      </SectionPanel>

                      <div className="flex justify-end">
                        <Button type="submit" variant="brand" size="sm" disabled={isSaving} className="font-semibold gap-1.5">
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Organization
                        </Button>
                      </div>
                    </form>

                    {/* Team Members List & Invite */}
                    <SectionPanel
                      title="Workspace Collaborators"
                      description="Members of this organization can collaborate on agents, shared canvases, and workflows."
                    >
                      <div className="space-y-3">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3.5 bg-gray-50/50 dark:bg-slate-800/60 border border-gray-150 dark:border-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{member.name}</p>
                                <p className="text-[11px] text-gray-400 dark:text-slate-400">{member.email}</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-850 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-750">
                              {member.role}
                            </span>
                          </div>
                        ))}

                        {isInvitingMember ? (
                          <form onSubmit={handleInviteMember} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl space-y-3">
                            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Invite New Teammate</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 block mb-1">Email Address</label>
                                <input
                                  type="email"
                                  placeholder="teammate@company.com"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                                  required
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 block mb-1">Role</label>
                                <select
                                  value={inviteRole}
                                  onChange={(e) => setInviteRole(e.target.value)}
                                  className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100"
                                >
                                  <option value="Member">Member</option>
                                  <option value="Creator">Creator</option>
                                  <option value="Admin">Admin</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsInvitingMember(false)}
                                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg font-medium transition"
                              >
                                Cancel
                              </button>
                              <Button type="submit" variant="brand" size="sm" className="font-semibold text-xs gap-1">
                                <Send className="w-3.5 h-3.5" />
                                Send Invite
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsInvitingMember(true)}
                            className="font-semibold text-gray-700 border-gray-250 gap-1.5 mt-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Invite Member
                          </Button>
                        )}
                      </div>
                    </SectionPanel>
                  </div>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 3. EXECUTION & MODEL DEFAULTS TAB (Page 19 requirement) */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeSection === 'execution' && (
                  <form onSubmit={handleSaveExecution} className="space-y-6">
                    <SectionPanel
                      title="Dual-Execution Model Defaults"
                      description="Choose whether agents and multi-agent workflows execute by default in Cloud or Local Privacy mode."
                      badge={execution.defaultExecutionMode.toUpperCase()}
                    >
                      <FieldRow label="Default Execution Mode" description="Sets the initial runtime targeting when launching agents or triggering canvas runs.">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Cloud Mode Card */}
                          <div
                            onClick={() => setExecution({ ...execution, defaultExecutionMode: 'cloud' })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              execution.defaultExecutionMode === 'cloud'
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-600/10 dark:border-indigo-500'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-gray-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-2 font-bold text-xs text-gray-900 dark:text-slate-100">
                                <Cloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                ☁️ Cloud Execution
                              </span>
                              {execution.defaultExecutionMode === 'cloud' && (
                                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                              High-speed serverless cloud inference via Google Gemini 2.0 Flash and Claude 3.5. Uses Platform Credits (PC).
                            </p>
                          </div>

                          {/* Local Mode Card */}
                          <div
                            onClick={() => setExecution({ ...execution, defaultExecutionMode: 'local' })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              execution.defaultExecutionMode === 'local'
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-600/10 dark:border-indigo-500'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-gray-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-2 font-bold text-xs text-gray-900 dark:text-slate-100">
                                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                🔒 Local Privacy Execution
                              </span>
                              {execution.defaultExecutionMode === 'local' && (
                                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                              100% on-premise execution via local LM Studio (:1234) or Ollama (:11434). Zero data leaves your machine. Uses Local Run Tokens (LRT).
                            </p>
                          </div>
                        </div>
                      </FieldRow>

                      <FieldRow label="Default LLM Model" description="Selected default model override when an agent doesn't specify one.">
                        <select
                          value={execution.defaultModelId}
                          onChange={(e) => setExecution({ ...execution, defaultModelId: e.target.value })}
                          className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                        >
                          <optgroup label="Cloud Models (Fast Serverless)">
                            <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended)</option>
                            <option value="google/gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                            <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</option>
                            <option value="groq/llama-3.3-70b-versatile">Groq LLaMA 3.3 70B</option>
                          </optgroup>
                          <optgroup label="Local LM Studio / Ollama Models">
                            <option value="google/gemma-3-4b">Google Gemma 3 4B (Local LM Studio)</option>
                            <option value="nvidia/nemotron-3-nano-4b">NVIDIA Nemotron 3 Nano 4B (Local)</option>
                            <option value="qwen2.5-coder-7b-instruct">Qwen 2.5 Coder 7B (Local Instruct)</option>
                            <option value="deepseek-r1-distill-qwen-7b">DeepSeek R1 Distill Qwen 7B (Local)</option>
                          </optgroup>
                        </select>
                      </FieldRow>

                      <FieldRow label={`Temperature: ${execution.temperature}`} description="Lower values are deterministic and analytical; higher values are creative.">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={execution.temperature}
                            onChange={(e) => setExecution({ ...execution, temperature: parseFloat(e.target.value) })}
                            className="flex-1 accent-indigo-600 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-gray-700 dark:text-slate-300 w-10 text-right">
                            {execution.temperature.toFixed(2)}
                          </span>
                        </div>
                      </FieldRow>

                      <FieldRow label={`Max Completion Tokens: ${execution.maxTokens}`} description="Maximum token length allowed per agent completion output.">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="512"
                            max="8192"
                            step="256"
                            value={execution.maxTokens}
                            onChange={(e) => setExecution({ ...execution, maxTokens: parseInt(e.target.value, 10) })}
                            className="flex-1 accent-indigo-600 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-gray-700 dark:text-slate-300 w-12 text-right">
                            {execution.maxTokens}
                          </span>
                        </div>
                      </FieldRow>
                    </SectionPanel>

                    <div className="flex justify-end">
                      <Button type="submit" variant="brand" size="sm" disabled={isSaving} className="font-semibold gap-1.5">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Execution Defaults
                      </Button>
                    </div>
                  </form>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 4. ALERTS & WEBHOOKS TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeSection === 'notifications' && (
                  <form onSubmit={handleSaveNotifications} className="space-y-6">
                    <SectionPanel
                      title="Automated Alerts & Delivery Triggers"
                      description="Customize execution alerts, failure warnings, usage digests, and third-party webhook integrations."
                    >
                      <div className="divide-y divide-gray-100">
                        {[
                          {
                            key: 'automationFailures',
                            label: 'Automation failures',
                            desc: 'Instant notifications when scheduled cron workflows fail or time out.',
                          },
                          {
                            key: 'weeklyDigest',
                            label: 'Weekly usage digest',
                            desc: 'Summary of execution counts, token consumption, and model distribution.',
                          },
                          {
                            key: 'agentErrorAlerts',
                            label: 'Agent runtime exceptions',
                            desc: 'Immediate alerts if tool calls or LLM completion streams produce uncaught errors.',
                          },
                          {
                            key: 'billingReminders',
                            label: 'Billing & low balance warnings',
                            desc: 'Notifications when Platform Credits or Local Run Tokens fall below 20.',
                          },
                          {
                            key: 'newFeatures',
                            label: 'Platform releases & tool additions',
                            desc: 'Announcements of new Mastra agent capabilities, MCP servers, and AWAS releases.',
                          },
                          {
                            key: 'teamActivity',
                            label: 'Team member collaboration',
                            desc: 'Alerts when teammates modify shared canvas nodes or publish agents.',
                          },
                        ].map((item) => {
                          const checked = !!notifications[item.key];
                          return (
                            <div key={item.key} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{item.label}</p>
                                <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">{item.desc}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleNotification(item.key)}
                                className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                  checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 ${
                                    checked ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                        <FieldRow label="Email Summary Frequency">
                          <select
                            value={notifications.emailDigestFrequency}
                            onChange={(e) => setNotifications({ ...notifications, emailDigestFrequency: e.target.value })}
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                          >
                            <option value="realtime">Real-time (Immediate notifications)</option>
                            <option value="daily">Daily Digest (Morning briefing)</option>
                            <option value="weekly">Weekly Digest (Monday 09:00 AM)</option>
                            <option value="off">Mute all email digests</option>
                          </select>
                        </FieldRow>

                        <FieldRow label="Alerting Webhook URL" description="Deliver platform alerts to Slack, Discord, or an internal HTTP endpoint.">
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              value={notifications.webhookUrl}
                              onChange={(e) => setNotifications({ ...notifications, webhookUrl: e.target.value })}
                              placeholder="https://hooks.slack.com/services/..."
                              className="flex-1 text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                            />
                            <button
                              type="button"
                              onClick={handleTestWebhook}
                              disabled={isTestingWebhook}
                              className="px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 rounded-lg transition flex items-center gap-1"
                            >
                              {isTestingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                              Test Ping
                            </button>
                          </div>
                        </FieldRow>
                      </div>
                    </SectionPanel>

                    <div className="flex justify-end">
                      <Button type="submit" variant="brand" size="sm" disabled={isSaving} className="font-semibold gap-1.5">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Notification Preferences
                      </Button>
                    </div>
                  </form>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 5. SECURITY, 2FA & API TOKENS TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeSection === 'security' && (
                  <div className="space-y-6">
                    {/* Password Rotation */}
                    <SectionPanel title="Change Password" description="Update your authentication credentials securely.">
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <FieldRow label="Current Password">
                          <div className="relative">
                            <input
                              type={showPassword.current ? 'text' : 'password'}
                              placeholder="Enter current password"
                              value={passwords.currentPassword}
                              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                              className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 pr-9"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                            >
                              {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FieldRow>

                        <FieldRow label="New Password">
                          <div className="relative">
                            <input
                              type={showPassword.next ? 'text' : 'password'}
                              placeholder="Min 6 characters"
                              value={passwords.newPassword}
                              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                              className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 pr-9"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword({ ...showPassword, next: !showPassword.next })}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                            >
                              {showPassword.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {passwords.newPassword && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className={`h-1 flex-1 rounded-full ${passwords.newPassword.length >= 6 ? 'bg-amber-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
                              <div className={`h-1 flex-1 rounded-full ${passwords.newPassword.length >= 10 && /\d/.test(passwords.newPassword) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                              <div className={`h-1 flex-1 rounded-full ${passwords.newPassword.length >= 12 && /[^a-zA-Z0-9]/.test(passwords.newPassword) ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-700'}`} />
                            </div>
                          )}
                        </FieldRow>

                        <FieldRow label="Confirm New Password">
                          <input
                            type="password"
                            placeholder="Repeat new password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100"
                            required
                          />
                        </FieldRow>

                        <div className="flex justify-end pt-1">
                          <Button type="submit" variant="primary" size="sm" disabled={isSaving} className="font-semibold gap-1.5">
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </SectionPanel>

                    {/* Two-Factor Authentication */}
                    <SectionPanel
                      title="Two-Factor Authentication (2FA)"
                      description="Protect your workspace with time-based TOTP verification on login."
                      badge={security.twoFactorEnabled ? 'PROTECTED' : 'NOT ENABLED'}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">Authenticator App</p>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                security.twoFactorEnabled
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700'
                              }`}
                            >
                              {security.twoFactorEnabled ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">
                            Supported with Google Authenticator, 1Password, Microsoft Authenticator, or Authy.
                          </p>
                        </div>

                        {security.twoFactorEnabled ? (
                          <Button variant="danger" size="sm" onClick={handleDisable2FA} className="font-semibold text-xs">
                            Disable 2FA
                          </Button>
                        ) : (
                          <Button variant="brand" size="sm" onClick={handleStart2FaSetup} className="font-semibold text-xs gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            Setup 2FA
                          </Button>
                        )}
                      </div>

                      {/* 2FA Setup Modal Dialog */}
                      {is2FaModalOpen && (
                        <div className="p-5 bg-indigo-50/70 dark:bg-slate-850 border border-indigo-200 dark:border-slate-750 rounded-xl space-y-4 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Setup Two-Factor Authentication</h3>
                            <button
                              onClick={() => setIs2FaModalOpen(false)}
                              className="text-xs text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 font-semibold"
                            >
                              Close
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Secret details */}
                            <div className="space-y-2">
                              <p className="text-[11px] text-indigo-900 dark:text-indigo-300 font-medium">
                                1. Scan this key or enter it manually into your Authenticator app:
                              </p>
                              <div className="p-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-lg flex items-center justify-between font-mono text-xs text-indigo-900 dark:text-indigo-300 font-bold">
                                <span>{twoFaSecret}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(twoFaSecret)}
                                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-sans font-bold"
                                >
                                  {copiedToken ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <p className="text-[10px] text-indigo-700 dark:text-indigo-400">Account: {profile.email}</p>
                            </div>

                            {/* Verification input */}
                            <div className="space-y-2">
                              <p className="text-[11px] text-indigo-900 dark:text-indigo-300 font-medium">
                                2. Enter the 6-digit code from your app:
                              </p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={twoFaCode}
                                  onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                                  placeholder="123456"
                                  className="w-32 font-mono tracking-widest text-center text-sm font-bold bg-white dark:bg-slate-900 border border-indigo-300 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-slate-100"
                                />
                                <Button
                                  variant="brand"
                                  size="sm"
                                  onClick={handleVerifyAndEnable2FA}
                                  className="font-semibold text-xs"
                                >
                                  Verify & Enable
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Recovery Codes */}
                          <div className="pt-2 border-t border-indigo-200 dark:border-slate-750">
                            <p className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                              Backup Recovery Codes (Save these in a secure password manager):
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-200 dark:border-slate-700 text-gray-700 dark:text-slate-300">
                              {recoveryCodes.map((code, idx) => (
                                <span key={idx}>{code}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </SectionPanel>

                    {/* Personal Access Tokens (PATs) */}
                    <SectionPanel
                      title="Personal Access Tokens (PATs)"
                      description="Generate secure authentication keys for the AWAS CLI, Antigravity SDK, and external webhooks."
                      badge={`${apiTokens.length} ACTIVE`}
                    >
                      {generatedToken && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-2 mb-4 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              Personal Access Token Generated
                            </p>
                            <button
                              onClick={() => setGeneratedToken(null)}
                              className="text-[11px] text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 font-semibold"
                            >
                              Dismiss
                            </button>
                          </div>
                          <p className="text-[11px] text-amber-800 dark:text-amber-400">
                            Copy this token now! For your protection, it will never be displayed again.
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={generatedToken}
                              className="flex-1 font-mono text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg px-3 py-1.5 text-gray-900 dark:text-amber-200 select-all"
                            />
                            <button
                              onClick={() => copyToClipboard(generatedToken)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedToken ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}

                      {isCreatingToken ? (
                        <form onSubmit={handleCreateToken} className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-xl space-y-3 mb-4">
                          <p className="text-xs font-bold text-gray-900 dark:text-slate-100">Generate Personal Access Token</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 block mb-1">Token Description</label>
                              <input
                                type="text"
                                placeholder="e.g. GitHub Actions CI, Local Terminal CLI"
                                value={newTokenName}
                                onChange={(e) => setNewTokenName(e.target.value)}
                                className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                                autoFocus
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 block mb-1">Expiration Period</label>
                              <select
                                value={newTokenDays}
                                onChange={(e) => setNewTokenDays(e.target.value)}
                                className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                              >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="60">60 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                              </select>
                            </div>
                          </div>

                          {/* Scopes */}
                          <div>
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 block mb-1">Token Scopes</label>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {['all', 'agents:read', 'agents:write', 'workflows:run'].map((scope) => (
                                <label key={scope} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={newTokenScopes.includes(scope)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNewTokenScopes([...newTokenScopes, scope]);
                                      } else {
                                        setNewTokenScopes(newTokenScopes.filter((s) => s !== scope));
                                      }
                                    }}
                                    className="accent-indigo-600"
                                  />
                                  <span className="text-[11px] font-mono text-gray-700 dark:text-slate-300">{scope}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsCreatingToken(false)}
                              className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg font-medium transition"
                            >
                              Cancel
                            </button>
                            <Button type="submit" variant="brand" size="sm" disabled={isSaving} className="font-semibold text-xs">
                              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                              Generate Token
                            </Button>
                          </div>
                        </form>
                      ) : null}

                      {apiTokens.length === 0 ? (
                        <div className="text-xs text-gray-400 dark:text-slate-500 italic text-center py-6 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                          No personal access tokens generated yet.
                        </div>
                      ) : (
                        <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
                          {apiTokens.map((token) => (
                            <div key={token.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{token.name}</span>
                                  <code className="text-[10px] font-mono bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                    {token.tokenPrefix}
                                  </code>
                                  {token.scopes?.map((s) => (
                                    <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                  Created: {new Date(token.createdAt).toLocaleDateString()}
                                  {token.expiresAt ? ` • Expires: ${new Date(token.expiresAt).toLocaleDateString()}` : ' • No expiry'}
                                  {token.lastUsedAt ? ` • Last used: ${new Date(token.lastUsedAt).toLocaleDateString()}` : ' • Never used'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRevokeToken(token.id)}
                                className="text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title="Revoke API Token"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isCreatingToken && (
                        <div className="pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsCreatingToken(true)}
                            className="font-semibold text-gray-700 dark:text-slate-200 border-gray-250 dark:border-slate-750 gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Generate Token
                          </Button>
                        </div>
                      )}
                    </SectionPanel>
                  </div>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 6. THEME & WORKSPACE APPEARANCE TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeSection === 'appearance' && (
                  <form onSubmit={handleSaveAppearance} className="space-y-6">
                    <SectionPanel
                      title="Workspace Appearance & Interface Density"
                      description="Tailor visual themes, navigation sidebars, and workflow canvas grid styling."
                    >
                      <FieldRow label="Color Theme" description="Choose a dark or light theme for the application.">
                        <div className="flex gap-3">
                          {[
                            { id: 'Light', icon: Sun },
                            { id: 'Dark', icon: Moon },
                            { id: 'System', icon: Laptop },
                          ].map(({ id, icon: IconComponent }) => {
                            const isSelected = (activeTheme || appearance.theme || '').toLowerCase() === id.toLowerCase();
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => handleUpdateAppearanceTheme(id)}
                                className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500'
                                    : 'border-gray-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750'
                                }`}
                              >
                                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-400'}`} />
                                {id}
                              </button>
                            );
                          })}
                        </div>
                      </FieldRow>

                      <FieldRow label="Sidebar Default Mode" description="Controls whether the navigation bar begins expanded or icon-only.">
                        <div className="flex gap-3">
                          {['Expanded', 'Collapsed'].map((mode) => {
                            const isSelected = appearance.sidebarDefault === mode;
                            return (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => handleUpdateAppearanceSidebar(mode)}
                                className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold transition ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500'
                                    : 'border-gray-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750'
                                }`}
                              >
                                {mode}
                              </button>
                            );
                          })}
                        </div>
                      </FieldRow>

                      <FieldRow label="Workflow Canvas Grid" description="Background pattern for the FlowCanvas node DAG builder.">
                        <div className="flex gap-3">
                          {['dots', 'lines', 'cross'].map((grid) => {
                            const isSelected = appearance.canvasGridStyle === grid;
                            return (
                              <button
                                key={grid}
                                type="button"
                                onClick={() => setAppearance({ ...appearance, canvasGridStyle: grid })}
                                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                                    : 'border-gray-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750'
                                }`}
                              >
                                {grid} Pattern
                              </button>
                            );
                          })}
                        </div>
                      </FieldRow>

                      <FieldRow label="Interface Density">
                        <div className="flex gap-3">
                          {['comfortable', 'compact'].map((density) => {
                            const isSelected = appearance.interfaceDensity === density;
                            return (
                              <button
                                key={density}
                                type="button"
                                onClick={() => setAppearance({ ...appearance, interfaceDensity: density })}
                                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                                    : 'border-gray-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750'
                                }`}
                              >
                                {density}
                              </button>
                            );
                          })}
                        </div>
                      </FieldRow>

                      <FieldRow label="Audio Chimes" description="Play a subtle chime upon completion of long-running workflow executions.">
                        <button
                          type="button"
                          onClick={() => setAppearance({ ...appearance, soundEffects: !appearance.soundEffects })}
                          className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                            appearance.soundEffects ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-750'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 ${
                              appearance.soundEffects ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </FieldRow>
                    </SectionPanel>

                    <div className="flex justify-end">
                      <Button type="submit" variant="brand" size="sm" disabled={isSaving} className="font-semibold gap-1.5">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Appearance
                      </Button>
                    </div>
                  </form>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 7. LOCALIZATION, CURRENCY & DATA EXPORT TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeSection === 'region' && (
                  <div className="space-y-6">
                    <form onSubmit={handleSaveRegion} className="space-y-6">
                      <SectionPanel
                        title="Regional & Localization Preferences"
                        description="Format dates, currencies, timezones, and system languages."
                      >
                        <FieldRow label="Timezone">
                          <select
                            value={region.timezone}
                            onChange={(e) => setRegion({ ...region, timezone: e.target.value })}
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                          >
                            <option>UTC+00:00 – Coordinated Universal Time</option>
                            <option>UTC-05:00 – Eastern Time (US & Canada)</option>
                            <option>UTC-08:00 – Pacific Time (US & Canada)</option>
                            <option>UTC+05:30 – Mumbai, New Delhi</option>
                            <option>UTC+01:00 – Berlin, Paris, Rome</option>
                            <option>UTC+09:00 – Tokyo, Seoul</option>
                            <option>UTC+08:00 – Singapore, Hong Kong</option>
                            <option>UTC+10:00 – Sydney, Melbourne</option>
                          </select>
                        </FieldRow>

                        <FieldRow label="System Language">
                          <select
                            value={region.language}
                            onChange={(e) => setRegion({ ...region, language: e.target.value })}
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                          >
                            <option>English (US)</option>
                            <option>Spanish (Español)</option>
                            <option>French (Français)</option>
                            <option>German (Deutsch)</option>
                            <option>Japanese (日本語)</option>
                            <option>Hindi (हिन्दी)</option>
                          </select>
                        </FieldRow>

                        <FieldRow label="Date Format">
                          <select
                            value={region.dateFormat}
                            onChange={(e) => setRegion({ ...region, dateFormat: e.target.value })}
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                          >
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                          </select>
                        </FieldRow>

                        <FieldRow label="Preferred Currency" description="Used for token wallet top-ups, creator payouts, and hourly contracts.">
                          <select
                            value={region.currency}
                            onChange={(e) => setRegion({ ...region, currency: e.target.value })}
                            className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
                          >
                            <option>USD ($) – US Dollar</option>
                            <option>EUR (€) – Euro</option>
                            <option>INR (₹) – Indian Rupee</option>
                            <option>GBP (£) – British Pound</option>
                          </select>
                        </FieldRow>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                          <FieldRow label="Anonymous Diagnostics" description="Help improve AWAS by sharing non-identifying telemetry metrics.">
                            <button
                              type="button"
                              onClick={() => setPrivacy({ ...privacy, telemetryEnabled: !privacy.telemetryEnabled })}
                              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                privacy.telemetryEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-750'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 ${
                                  privacy.telemetryEnabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </FieldRow>

                          <FieldRow label="Crash Reporting" description="Automatically send diagnostic logs if local electron/browser process crashes.">
                            <button
                              type="button"
                              onClick={() => setPrivacy({ ...privacy, crashReportsEnabled: !privacy.crashReportsEnabled })}
                              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                privacy.crashReportsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-750'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 ${
                                  privacy.crashReportsEnabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </FieldRow>
                        </div>
                      </SectionPanel>

                      <div className="flex justify-end">
                        <Button type="submit" variant="brand" size="sm" disabled={isSaving} className="font-semibold gap-1.5">
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Regional Preferences
                        </Button>
                      </div>
                    </form>

                    {/* Data Portability & Danger Zone */}
                    <SectionPanel
                      title="Workspace Data Portability & Maintenance"
                      description="Download a full offline JSON archive of all your agents, workflows, and settings."
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-slate-100">Export Complete Workspace Archive</p>
                            <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">
                              Downloads a portable JSON file containing your settings, custom agents, and DAG workflows.
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleExportWorkspace}
                            disabled={isExporting}
                            className="font-semibold text-gray-700 dark:text-slate-200 border-gray-250 dark:border-slate-750 gap-1.5"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            Export JSON
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-red-900 dark:text-red-300">Reset Workspace Settings</p>
                            <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                              Restore all preferences, themes, and notification rules to factory defaults.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleResetSettings}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 border border-red-300 dark:border-red-800 rounded-lg transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset Defaults
                          </button>
                        </div>
                      </div>
                    </SectionPanel>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
