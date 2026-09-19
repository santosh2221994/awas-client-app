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
} from 'lucide-react';
import Button from '../../components/Button';
import settingsService from '../../api/services/settingsService';
import { useSessionStore } from '../../stores/useSessionStore';
import { useUIStore } from '../../stores/useUIStore';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'region', label: 'Region & Language', icon: Globe },
];

function SectionPanel({ children, title, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, description, children }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="sm:w-64 flex-shrink-0">
        <label className="text-xs font-semibold text-gray-800">{label}</label>
        {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Global store sync
  const sessionUser = useSessionStore((s) => s.user);
  const setOrganization = useSessionStore((s) => s.setOrganization);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    jobTitle: '',
    bio: '',
    avatarUrl: '',
    role: 'user',
  });

  // Organization Form State
  const [organization, setOrgState] = useState({
    name: 'Acme Corp',
    slug: 'acme-corp',
    website: 'https://acme.io',
    industry: 'Software & Technology',
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    automationFailures: true,
    weeklyDigest: true,
    agentErrorAlerts: true,
    billingReminders: false,
    newFeatures: false,
    teamActivity: true,
  });

  // Appearance State
  const [appearance, setAppearance] = useState({
    theme: 'Light',
    sidebarDefault: 'Expanded',
  });

  // Region State
  const [region, setRegion] = useState({
    timezone: 'UTC+05:30 – Mumbai, New Delhi',
    language: 'English (US)',
    dateFormat: 'MM/DD/YYYY',
  });

  // Security State
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
  });

  // Password Update Form State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // API Tokens State
  const [apiTokens, setApiTokens] = useState([]);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenDays, setNewTokenDays] = useState('30');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Load Settings from Backend
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
          });
        }
        if (data.organization) {
          setOrgState({
            name: data.organization.name || '',
            slug: data.organization.slug || '',
            website: data.organization.website || '',
            industry: data.organization.industry || 'Software & Technology',
          });
        }
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        if (data.appearance) {
          setAppearance(data.appearance);
        }
        if (data.region) {
          setRegion(data.region);
        }
        if (data.security) {
          setSecurity(data.security);
        }
      }

      // Also load API tokens
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

  // Save Handlers
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
      showToast('success', 'Personal profile updated successfully!');
      // Update session store user
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

  const handleSaveOrganization = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      const updated = await settingsService.updateOrganization(organization);
      setOrgState(updated);
      setOrganization(updated);
      showToast('success', 'Organization details saved successfully!');
    } catch (err) {
      console.error('Update org error:', err);
      showToast('error', err?.message || 'Failed to update organization.');
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleUpdateAppearanceTheme = async (theme) => {
    const updated = { ...appearance, theme };
    setAppearance(updated);
    try {
      await settingsService.updateAppearance(updated);
      showToast('success', `Theme updated to ${theme}`);
    } catch (err) {
      console.error('Update appearance error:', err);
      showToast('error', 'Failed to update theme.');
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
      console.error('Update sidebar error:', err);
      showToast('error', 'Failed to update sidebar preference.');
    }
  };

  const handleSaveRegion = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      const updated = await settingsService.updateRegion(region);
      setRegion(updated);
      showToast('success', 'Regional and language settings saved!');
    } catch (err) {
      console.error('Update region error:', err);
      showToast('error', err?.message || 'Failed to update regional settings.');
    } finally {
      setIsSaving(false);
    }
  };

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
      showToast('success', 'Password updated successfully!');
    } catch (err) {
      console.error('Change password error:', err);
      showToast('error', err?.message || 'Current password incorrect.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const nextState = !security.twoFactorEnabled;
      const res = await settingsService.toggle2FA(nextState);
      setSecurity((s) => ({ ...s, twoFactorEnabled: res.twoFactorEnabled }));
      showToast('success', `Two-Factor Authentication ${res.twoFactorEnabled ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      console.error('Toggle 2FA error:', err);
      showToast('error', 'Failed to toggle 2FA.');
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
      const res = await settingsService.createApiToken(newTokenName.trim(), Number(newTokenDays));
      setGeneratedToken(res.token);
      setApiTokens((prev) => [
        {
          id: res.id,
          name: res.name,
          tokenPrefix: res.tokenPrefix,
          createdAt: res.createdAt,
          expiresAt: res.expiresAt,
          lastUsedAt: null,
        },
        ...prev,
      ]);
      setNewTokenName('');
      setIsCreatingToken(false);
      showToast('success', 'Personal access token created successfully!');
    } catch (err) {
      console.error('Create token error:', err);
      showToast('error', err?.message || 'Failed to generate token.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to revoke this API token? Any application using it will lose access.')) {
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

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your account, organization, and workspace preferences</p>
          </div>
          <button
            onClick={loadSettings}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 rounded-lg transition"
            title="Reload settings from server"
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
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Sidebar Nav */}
          <aside className="sm:w-52 flex-shrink-0">
            <nav className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden sticky top-6">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full text-left text-xs font-semibold transition-all border-b border-gray-50 last:border-0 ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-6 min-w-0">
            {isLoading ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-xs font-medium text-gray-500">Loading settings from MongoDB Atlas...</p>
              </div>
            ) : (
              <>
                {/* 1. PROFILE SECTION */}
                {activeSection === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <SectionPanel
                      title="Personal Information"
                      description="Update your name, email, and public-facing profile details."
                    >
                      <FieldRow label="Full Name" description="Displayed across the platform and collaborative canvases.">
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          placeholder="e.g. Alex Johnson"
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400"
                        />
                      </FieldRow>
                      <FieldRow label="Email Address" description="Used for authentication, notifications, and billing.">
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none font-medium text-gray-500 cursor-not-allowed"
                        />
                      </FieldRow>
                      <FieldRow label="Job Title" description="Your functional role or designation.">
                        <input
                          type="text"
                          value={profile.jobTitle}
                          onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                          placeholder="e.g. Product Engineer / Prompt Specialist"
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400"
                        />
                      </FieldRow>
                      <FieldRow label="Bio" description="Short description shown on published agents and talent profiles.">
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="Tell collaborators about your expertise..."
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-800 h-24 resize-none"
                        />
                      </FieldRow>
                    </SectionPanel>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="brand"
                        size="sm"
                        disabled={isSaving}
                        className="font-semibold gap-1.5"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}

                {/* 2. ORGANIZATION SECTION */}
                {activeSection === 'organization' && (
                  <form onSubmit={handleSaveOrganization} className="space-y-6">
                    <SectionPanel
                      title="Organization Details"
                      description="Configure your workspace organization name, public handle, website, and industry."
                    >
                      <FieldRow label="Organization Name">
                        <input
                          type="text"
                          value={organization.name}
                          onChange={(e) => setOrgState({ ...organization, name: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          required
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-800"
                        />
                      </FieldRow>
                      <FieldRow label="Slug / Handle" description="Used in workspace URLs and multi-tenant API calls.">
                        <input
                          type="text"
                          value={organization.slug}
                          onChange={(e) => setOrgState({ ...organization, slug: e.target.value })}
                          placeholder="e.g. acme-corp"
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-800"
                        />
                      </FieldRow>
                      <FieldRow label="Website">
                        <input
                          type="url"
                          value={organization.website}
                          onChange={(e) => setOrgState({ ...organization, website: e.target.value })}
                          placeholder="https://acme.io"
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-800"
                        />
                      </FieldRow>
                      <FieldRow label="Industry">
                        <select
                          value={organization.industry}
                          onChange={(e) => setOrgState({ ...organization, industry: e.target.value })}
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer"
                        >
                          <option>Software & Technology</option>
                          <option>Artificial Intelligence & Robotics</option>
                          <option>Finance & Banking</option>
                          <option>Healthcare & Life Sciences</option>
                          <option>E-commerce & Retail</option>
                          <option>Professional Services</option>
                          <option>Other</option>
                        </select>
                      </FieldRow>
                    </SectionPanel>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="brand"
                        size="sm"
                        disabled={isSaving}
                        className="font-semibold gap-1.5"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}

                {/* 3. NOTIFICATIONS SECTION */}
                {activeSection === 'notifications' && (
                  <SectionPanel
                    title="Notification Preferences"
                    description="Choose which events trigger automated notifications and email digests."
                  >
                    <div className="divide-y divide-gray-100">
                      {[
                        {
                          key: 'automationFailures',
                          label: 'Automation failures',
                          desc: 'Instant alerts when scheduled workflow runs fail or time out.',
                        },
                        {
                          key: 'weeklyDigest',
                          label: 'Weekly usage digest',
                          desc: 'Summary of execution counts, token consumption, and model distribution.',
                        },
                        {
                          key: 'agentErrorAlerts',
                          label: 'Agent error alerts',
                          desc: 'Immediate notifications if an agent encounters runtime tool execution exceptions.',
                        },
                        {
                          key: 'billingReminders',
                          label: 'Billing reminders',
                          desc: 'Low Platform Credit balances and subscription renewal alerts.',
                        },
                        {
                          key: 'newFeatures',
                          label: 'New feature announcements',
                          desc: 'Updates on newly added Mastra agents, tools, and AWAS release notes.',
                        },
                        {
                          key: 'teamActivity',
                          label: 'Team member activity',
                          desc: 'Alerts when workspace teammates publish or edit shared agents and canvases.',
                        },
                      ].map((item) => {
                        const checked = !!notifications[item.key];
                        return (
                          <div key={item.key} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleNotification(item.key)}
                              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                checked ? 'bg-indigo-600' : 'bg-gray-200'
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
                  </SectionPanel>
                )}

                {/* 4. SECURITY SECTION */}
                {activeSection === 'security' && (
                  <div className="space-y-6">
                    {/* Password Change */}
                    <SectionPanel title="Change Password" description="Update your account password securely.">
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <FieldRow label="Current Password">
                          <input
                            type="password"
                            placeholder="Enter current password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800"
                          />
                        </FieldRow>
                        <FieldRow label="New Password">
                          <input
                            type="password"
                            placeholder="Min 6 characters"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800"
                          />
                        </FieldRow>
                        <FieldRow label="Confirm New Password">
                          <input
                            type="password"
                            placeholder="Repeat new password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800"
                          />
                        </FieldRow>
                        <div className="flex justify-end pt-2">
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={isSaving}
                            className="font-semibold gap-1.5"
                          >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </SectionPanel>

                    {/* Two-Factor Authentication */}
                    <SectionPanel
                      title="Two-Factor Authentication"
                      description="Add an extra layer of defense with time-based one-time authentication."
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-800">Authenticator App (TOTP)</p>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                security.twoFactorEnabled
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {security.twoFactorEnabled ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Protect your account with Google Authenticator, 1Password, or Authy.
                          </p>
                        </div>
                        <Button
                          variant={security.twoFactorEnabled ? 'secondary' : 'brand'}
                          size="sm"
                          onClick={handleToggle2FA}
                          className="font-semibold text-xs"
                        >
                          {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </Button>
                      </div>
                    </SectionPanel>

                    {/* Personal Access Tokens */}
                    <SectionPanel
                      title="Personal Access Tokens (PATs)"
                      description="Manage personal API access tokens used for CLI automation and external webhooks."
                    >
                      {generatedToken && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-amber-600" />
                              New API Token Generated
                            </p>
                            <button
                              onClick={() => setGeneratedToken(null)}
                              className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold"
                            >
                              Dismiss
                            </button>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Make sure to copy your personal access token now. You will not be able to see it again!
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={generatedToken}
                              className="flex-1 font-mono text-xs bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-gray-900 select-all"
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
                        <form onSubmit={handleCreateToken} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 mb-4">
                          <p className="text-xs font-bold text-gray-900">Generate New Token</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-gray-700 block mb-1">Token Name</label>
                              <input
                                type="text"
                                placeholder="e.g. CLI Automation, GitHub Actions"
                                value={newTokenName}
                                onChange={(e) => setNewTokenName(e.target.value)}
                                className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500"
                                autoFocus
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-gray-700 block mb-1">Expiration</label>
                              <select
                                value={newTokenDays}
                                onChange={(e) => setNewTokenDays(e.target.value)}
                                className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500"
                              >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="60">60 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsCreatingToken(false)}
                              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition"
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
                        <div className="text-xs text-gray-400 italic text-center py-6 border border-dashed border-gray-200 rounded-xl">
                          No active API tokens created yet.
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                          {apiTokens.map((token) => (
                            <div key={token.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-gray-900">{token.name}</span>
                                  <code className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {token.tokenPrefix}
                                  </code>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Created on {new Date(token.createdAt).toLocaleDateString()}
                                  {token.expiresAt ? ` • Expires ${new Date(token.expiresAt).toLocaleDateString()}` : ''}
                                  {token.lastUsedAt ? ` • Last used ${new Date(token.lastUsedAt).toLocaleDateString()}` : ' • Never used'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRevokeToken(token.id)}
                                className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                                title="Revoke Token"
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
                            className="font-semibold text-gray-700 border-gray-250 gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Generate Token
                          </Button>
                        </div>
                      )}
                    </SectionPanel>
                  </div>
                )}

                {/* 5. APPEARANCE SECTION */}
                {activeSection === 'appearance' && (
                  <SectionPanel
                    title="Appearance Preferences"
                    description="Customize workspace themes and navigation layout."
                  >
                    <FieldRow label="Theme" description="Select your preferred workspace color theme.">
                      <div className="flex gap-3">
                        {[
                          { id: 'Light', icon: Sun },
                          { id: 'Dark', icon: Moon },
                          { id: 'System', icon: Laptop },
                        ].map(({ id, icon: IconComponent }) => {
                          const isSelected = appearance.theme === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => handleUpdateAppearanceTheme(id)}
                              className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                                isSelected
                                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-xs'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                              {id}
                            </button>
                          );
                        })}
                      </div>
                    </FieldRow>

                    <FieldRow label="Sidebar Default" description="Set whether the global sidebar opens expanded or collapsed.">
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
                                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-xs'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                    </FieldRow>
                  </SectionPanel>
                )}

                {/* 6. REGION & LANGUAGE SECTION */}
                {activeSection === 'region' && (
                  <form onSubmit={handleSaveRegion} className="space-y-6">
                    <SectionPanel
                      title="Region & Language"
                      description="Set your timezone, locale, and date format preferences."
                    >
                      <FieldRow label="Timezone">
                        <select
                          value={region.timezone}
                          onChange={(e) => setRegion({ ...region, timezone: e.target.value })}
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer"
                        >
                          <option>UTC+00:00 – Coordinated Universal Time</option>
                          <option>UTC-05:00 – Eastern Time (US & Canada)</option>
                          <option>UTC-08:00 – Pacific Time (US & Canada)</option>
                          <option>UTC+05:30 – Mumbai, New Delhi</option>
                          <option>UTC+01:00 – Berlin, Paris, Rome</option>
                          <option>UTC+09:00 – Tokyo, Seoul</option>
                          <option>UTC+08:00 – Singapore, Hong Kong</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Language">
                        <select
                          value={region.language}
                          onChange={(e) => setRegion({ ...region, language: e.target.value })}
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer"
                        >
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Japanese</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Date Format">
                        <select
                          value={region.dateFormat}
                          onChange={(e) => setRegion({ ...region, dateFormat: e.target.value })}
                          className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer"
                        >
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </FieldRow>
                    </SectionPanel>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="brand"
                        size="sm"
                        disabled={isSaving}
                        className="font-semibold gap-1.5"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
