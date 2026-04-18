import { useState } from 'react';
import { Bell, Lock, Eye, User, Database, LogOut, ArrowLeft } from 'lucide-react';
import colors from '../theme/color';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectOption } from '../components/ui/select';
import '../styles/settings.css';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    fullName: 'IDB Admin',
    email: 'admin@idb.lk',
    phone: '+94 11 123 4567',
    department: 'Administration',
    role: 'Administrator',
    notificationsEmail: true,
    notificationsInApp: true,
    notificationsSMS: false,
    twoFactorAuth: false,
    dataExport: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleToggle = (name) => {
    setSettings({ ...settings, [name]: !settings[name] });
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const handleLogout = () => {
    // Add logout logic
    console.log('Logging out...');
  };

  return (
    <div className='settings-layout'>
      <Sidebar handleLogout={handleLogout} />
      
      <div className='settings-main'>
        {/* Settings Header */}
        <div className='settings-header'>
          <div className='header-left'>
            <h1>Settings</h1>
            <p className='header-subtitle'>Manage your account and preferences</p>
          </div>

          <div className='header-right'>
            <a href='/dashboard' className='back-to-dashboard'>
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </a>
          </div>
        </div>

      {/* Settings Content */}
      <div className='settings-content-wrapper'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='settings-tabs'>
          <TabsList className='settings-tab-list'>
            <TabsTrigger value='profile'>
              <User size={18} /> Profile
            </TabsTrigger>
            <TabsTrigger value='notifications'>
              <Bell size={18} /> Notifications
            </TabsTrigger>
            <TabsTrigger value='security'>
              <Lock size={18} /> Security
            </TabsTrigger>
            <TabsTrigger value='privacy'>
              <Eye size={18} /> Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value='profile'>
            <Card className='settings-card'>
              <CardHeader className='card-header-with-icon'>
                <div className='card-title-wrapper'>
                  <User size={24} className='card-icon' />
                  <div>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='form-group'>
                  <Label htmlFor='fullName'>Full Name</Label>
                  <Input
                    id='fullName'
                    type='text'
                    name='fullName'
                    value={settings.fullName}
                    onChange={handleInputChange}
                    placeholder='Enter your full name'
                  />
                </div>

                <div className='form-group'>
                  <Label htmlFor='email'>Email Address</Label>
                  <Input
                    id='email'
                    type='email'
                    name='email'
                    value={settings.email}
                    onChange={handleInputChange}
                    placeholder='Enter your email'
                  />
                </div>

                <div className='form-group'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    type='tel'
                    name='phone'
                    value={settings.phone}
                    onChange={handleInputChange}
                    placeholder='Enter your phone number'
                  />
                </div>

                <div className='form-group'>
                  <Label htmlFor='department'>Department</Label>
                  <Input
                    id='department'
                    type='text'
                    name='department'
                    value={settings.department}
                    onChange={handleInputChange}
                    placeholder='Enter your department'
                  />
                </div>

                <div className='form-group'>
                  <Label htmlFor='role'>Role</Label>
                  <Select
                    id='role'
                    name='role'
                    value={settings.role}
                    onChange={handleInputChange}
                  >
                    <SelectOption value='Administrator'>Administrator</SelectOption>
                    <SelectOption value='Manager'>Manager</SelectOption>
                    <SelectOption value='Staff'>Staff</SelectOption>
                    <SelectOption value='Viewer'>Viewer</SelectOption>
                  </Select>
                </div>

                <Button onClick={handleSave} style={{ backgroundColor: colors.gold.main, color: '#000' }}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value='notifications'>
            <Card className='settings-card'>
              <CardHeader className='card-header-with-icon'>
                <div className='card-title-wrapper'>
                  <Bell size={24} className='card-icon' />
                  <div>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='toggle-item'>
                  <div className='toggle-info'>
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className='toggle-switch'>
                    <input
                      type='checkbox'
                      checked={settings.notificationsEmail}
                      onChange={() => handleToggle('notificationsEmail')}
                    />
                    <span className='slider' style={{ backgroundColor: settings.notificationsEmail ? colors.navy.main : '#ccc' }}></span>
                  </label>
                </div>

                <div className='toggle-item'>
                  <div className='toggle-info'>
                    <h3>In-App Notifications</h3>
                    <p>Receive notifications within the application</p>
                  </div>
                  <label className='toggle-switch'>
                    <input
                      type='checkbox'
                      checked={settings.notificationsInApp}
                      onChange={() => handleToggle('notificationsInApp')}
                    />
                    <span className='slider' style={{ backgroundColor: settings.notificationsInApp ? colors.navy.main : '#ccc' }}></span>
                  </label>
                </div>

                <div className='toggle-item'>
                  <div className='toggle-info'>
                    <h3>SMS Notifications</h3>
                    <p>Receive notifications via SMS</p>
                  </div>
                  <label className='toggle-switch'>
                    <input
                      type='checkbox'
                      checked={settings.notificationsSMS}
                      onChange={() => handleToggle('notificationsSMS')}
                    />
                    <span className='slider' style={{ backgroundColor: settings.notificationsSMS ? colors.navy.main : '#ccc' }}></span>
                  </label>
                </div>

                <Button onClick={handleSave} style={{ backgroundColor: colors.gold.main, color: '#000' }}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value='security'>
            <Card className='settings-card'>
              <CardHeader className='card-header-with-icon'>
                <div className='card-title-wrapper'>
                  <Lock size={24} className='card-icon' />
                  <div>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Keep your account secure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='toggle-item'>
                  <div className='toggle-info'>
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <label className='toggle-switch'>
                    <input
                      type='checkbox'
                      checked={settings.twoFactorAuth}
                      onChange={() => handleToggle('twoFactorAuth')}
                    />
                    <span className='slider' style={{ backgroundColor: settings.twoFactorAuth ? colors.navy.main : '#ccc' }}></span>
                  </label>
                </div>

                <div className='security-section'>
                  <h3>Change Password</h3>
                  <div className='mt-4 space-y-4'>
                    <div>
                      <Label htmlFor='currentPassword'>Current Password</Label>
                      <Input id='currentPassword' type='password' placeholder='Enter current password' />
                    </div>
                    <div>
                      <Label htmlFor='newPassword'>New Password</Label>
                      <Input id='newPassword' type='password' placeholder='Enter new password' />
                    </div>
                    <div>
                      <Label htmlFor='confirmPassword'>Confirm Password</Label>
                      <Input id='confirmPassword' type='password' placeholder='Confirm new password' />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} style={{ backgroundColor: colors.gold.main, color: '#000' }}>
                  Update Security
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value='privacy'>
            <Card className='settings-card'>
              <CardHeader className='card-header-with-icon'>
                <div className='card-title-wrapper'>
                  <Eye size={24} className='card-icon' />
                  <div>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your data and privacy</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='toggle-item'>
                  <div className='toggle-info'>
                    <h3>Data Export</h3>
                    <p>Export your personal data</p>
                  </div>
                  <Button variant='outline' style={{ borderColor: colors.navy.main, color: colors.navy.main }}>
                    <Database size={16} /> Export Data
                  </Button>
                </div>

                <div className='toggle-item' style={{ backgroundColor: '#fff5f5', borderColor: colors.red.main }}>
                  <div className='toggle-info'>
                    <h3 style={{ color: colors.red.main }}>Danger Zone</h3>
                    <p>Irreversible operations</p>
                  </div>
                  <Button style={{ backgroundColor: colors.red.main, color: 'white' }}>
                    <LogOut size={16} /> Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
