import React, { useState } from 'react';
import { User, Building2, Bell, Shield, Palette, Globe, Save, Sun, Moon, Laptop, Check } from 'lucide-react';
import Button from '../../components/Button';

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

function TextInput({ defaultValue, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400 text-gray-800"
    />
  );
}

function ToggleSwitch({ defaultChecked = false, label }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-700 font-medium">{label}</span>
      <button
        onClick={() => setChecked(c => !c)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your account, organization, and workspace preferences</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Sidebar Nav */}
          <aside className="sm:w-48 flex-shrink-0">
            <nav className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-4 py-3 w-full text-left text-xs font-semibold transition-all border-b border-gray-50 last:border-0 ${activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${activeSection === section.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-6 min-w-0">
            {activeSection === 'profile' && (
              <>
                <SectionPanel title="Personal Information" description="Update your name, email, and public-facing details.">
                  <FieldRow label="Full Name" description="Displayed across the platform.">
                    <TextInput defaultValue="Alex Johnson" />
                  </FieldRow>
                  <FieldRow label="Email Address" description="Used for login and notifications.">
                    <TextInput defaultValue="alex@company.io" type="email" />
                  </FieldRow>
                  <FieldRow label="Job Title">
                    <TextInput defaultValue="Product Engineer" />
                  </FieldRow>
                  <FieldRow label="Bio" description="Short description shown on your profile.">
                    <textarea
                      defaultValue="Building agentic workflows at the edge."
                      className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-800 h-20 resize-none"
                    />
                  </FieldRow>
                </SectionPanel>
                <div className="flex justify-end">
                  <Button variant="brand" size="sm" className="font-semibold gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </Button>
                </div>
              </>
            )}

            {activeSection === 'organization' && (
              <>
                <SectionPanel title="Organization Details" description="Configure your workspace name, logo, and metadata.">
                  <FieldRow label="Organization Name">
                    <TextInput defaultValue="Acme Corp" />
                  </FieldRow>
                  <FieldRow label="Slug / Handle" description="Used in URLs and API references.">
                    <TextInput defaultValue="acme-corp" />
                  </FieldRow>
                  <FieldRow label="Website">
                    <TextInput defaultValue="https://acme.io" type="url" />
                  </FieldRow>
                  <FieldRow label="Industry">
                    <select className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer">
                      <option>Software & Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>E-commerce</option>
                      <option>Other</option>
                    </select>
                  </FieldRow>
                </SectionPanel>
                <div className="flex justify-end">
                  <Button variant="brand" size="sm" className="font-semibold gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </Button>
                </div>
              </>
            )}

            {activeSection === 'notifications' && (
              <SectionPanel title="Notification Preferences" description="Choose which events trigger email or in-app alerts.">
                <div className="space-y-4">
                  {[
                    { label: 'Automation failures', defaultChecked: true },
                    { label: 'Weekly usage digest', defaultChecked: true },
                    { label: 'Agent error alerts', defaultChecked: true },
                    { label: 'Billing reminders', defaultChecked: false },
                    { label: 'New feature announcements', defaultChecked: false },
                    { label: 'Team member activity', defaultChecked: true },
                  ].map((n) => (
                    <ToggleSwitch key={n.label} label={n.label} defaultChecked={n.defaultChecked} />
                  ))}
                </div>
              </SectionPanel>
            )}

            {activeSection === 'security' && (
              <>
                <SectionPanel title="Password" description="Change your account password.">
                  <FieldRow label="Current Password">
                    <TextInput placeholder="Enter current password" type="password" />
                  </FieldRow>
                  <FieldRow label="New Password">
                    <TextInput placeholder="Min 12 characters" type="password" />
                  </FieldRow>
                  <FieldRow label="Confirm New Password">
                    <TextInput placeholder="Repeat new password" type="password" />
                  </FieldRow>
                  <Button variant="primary" size="sm" className="font-semibold">Update Password</Button>
                </SectionPanel>
                <SectionPanel title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Authenticator App</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Use Google Authenticator or Authy to generate TOTP codes.</p>
                    </div>
                    <Button variant="brand" size="sm" className="font-semibold">Enable 2FA</Button>
                  </div>
                </SectionPanel>
                <SectionPanel title="API Tokens" description="Manage personal access tokens for the AWAS API.">
                  <div className="text-xs text-gray-400 italic text-center py-4">No API tokens created yet.</div>
                  <Button variant="secondary" size="sm" className="font-semibold text-gray-700 border-gray-250">
                    Generate Token
                  </Button>
                </SectionPanel>
              </>
            )}

            {activeSection === 'appearance' && (
              <SectionPanel title="Appearance" description="Customize the visual look of the workspace.">
                <FieldRow label="Theme">
                  <div className="flex gap-3">
                    {['Light', 'Dark', 'System'].map((t) => (
                      <button
                        key={t}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition ${t === 'Light'
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Sidebar Default">
                  <div className="flex gap-3">
                    {['Expanded', 'Collapsed'].map((t) => (
                      <button
                        key={t}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition ${t === 'Expanded'
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </FieldRow>
              </SectionPanel>
            )}

            {activeSection === 'region' && (
              <SectionPanel title="Region & Language" description="Set your timezone, locale, and date format preferences.">
                <FieldRow label="Timezone">
                  <select className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer">
                    <option>UTC+00:00 – Coordinated Universal Time</option>
                    <option>UTC-05:00 – Eastern Time (US & Canada)</option>
                    <option>UTC-08:00 – Pacific Time (US & Canada)</option>
                    <option>UTC+05:30 – Mumbai, New Delhi</option>
                    <option>UTC+01:00 – Berlin, Paris, Rome</option>
                  </select>
                </FieldRow>
                <FieldRow label="Language">
                  <select className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </FieldRow>
                <FieldRow label="Date Format">
                  <select className="w-full text-xs bg-white border border-gray-250 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-gray-800 cursor-pointer">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </FieldRow>
                <div className="flex justify-end pt-2">
                  <Button variant="brand" size="sm" className="font-semibold gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </Button>
                </div>
              </SectionPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
