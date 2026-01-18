import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Trash2,
  FileArchive,
  Shield,
  Calendar,
  Settings,
  Play,
  Pause,
  Loader2,
  Info,
  Server,
  Table,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BackupRecord {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'selective';
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  size: string;
  tables: string[];
  created_at: string;
  completed_at?: string;
  created_by: string;
  notes?: string;
}

interface TableInfo {
  name: string;
  rowCount: number;
  size: string;
  lastModified: string;
  selected: boolean;
}

const mockBackups: BackupRecord[] = [
  {
    id: '1',
    name: 'Full Backup - Jan 18, 2026',
    type: 'full',
    status: 'completed',
    size: '245 MB',
    tables: ['All tables'],
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    created_by: 'System',
  },
  {
    id: '2',
    name: 'Daily Incremental',
    type: 'incremental',
    status: 'completed',
    size: '12 MB',
    tables: ['orders', 'order_items', 'products'],
    created_at: subDays(new Date(), 1).toISOString(),
    completed_at: subDays(new Date(), 1).toISOString(),
    created_by: 'Automated',
  },
  {
    id: '3',
    name: 'Products & Orders Backup',
    type: 'selective',
    status: 'completed',
    size: '89 MB',
    tables: ['products', 'orders', 'order_items'],
    created_at: subDays(new Date(), 3).toISOString(),
    completed_at: subDays(new Date(), 3).toISOString(),
    created_by: 'Admin',
  },
  {
    id: '4',
    name: 'Weekly Full Backup',
    type: 'full',
    status: 'scheduled',
    size: '--',
    tables: ['All tables'],
    created_at: new Date(Date.now() + 86400000).toISOString(),
    created_by: 'Scheduled',
  },
];

const mockTables: TableInfo[] = [
  { name: 'products', rowCount: 1250, size: '45 MB', lastModified: new Date().toISOString(), selected: false },
  { name: 'orders', rowCount: 8540, size: '78 MB', lastModified: new Date().toISOString(), selected: false },
  { name: 'order_items', rowCount: 24500, size: '52 MB', lastModified: new Date().toISOString(), selected: false },
  { name: 'users', rowCount: 15200, size: '12 MB', lastModified: new Date().toISOString(), selected: false },
  { name: 'profiles', rowCount: 15200, size: '18 MB', lastModified: new Date().toISOString(), selected: false },
  { name: 'categories', rowCount: 45, size: '1 MB', lastModified: subDays(new Date(), 2).toISOString(), selected: false },
  { name: 'brands', rowCount: 120, size: '2 MB', lastModified: subDays(new Date(), 5).toISOString(), selected: false },
  { name: 'sellers', rowCount: 340, size: '8 MB', lastModified: new Date().toISOString(), selected: false },
  { name: 'reviews', rowCount: 4200, size: '15 MB', lastModified: new Date().toISOString(), selected: false },
  { name: 'coupons', rowCount: 85, size: '0.5 MB', lastModified: subDays(new Date(), 1).toISOString(), selected: false },
];

export default function AdminBackup() {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>(mockBackups);
  const [tables, setTables] = useState<TableInfo[]>(mockTables);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Backup settings
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'selective'>('full');
  const [backupName, setBackupName] = useState('');
  const [backupNotes, setBackupNotes] = useState('');
  
  // Schedule settings
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('02:00');
  const [retentionDays, setRetentionDays] = useState('30');

  const stats = {
    totalBackups: backups.length,
    lastBackup: backups.find(b => b.status === 'completed')?.created_at,
    totalSize: '426 MB',
    scheduledBackups: backups.filter(b => b.status === 'scheduled').length,
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setBackupProgress(100);
      
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        name: backupName || `${backupType.charAt(0).toUpperCase() + backupType.slice(1)} Backup - ${format(new Date(), 'MMM d, yyyy HH:mm')}`,
        type: backupType,
        status: 'completed',
        size: backupType === 'full' ? '245 MB' : backupType === 'incremental' ? '12 MB' : `${tables.filter(t => t.selected).length * 15} MB`,
        tables: backupType === 'selective' ? tables.filter(t => t.selected).map(t => t.name) : ['All tables'],
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_by: 'Admin',
        notes: backupNotes,
      };

      setBackups([newBackup, ...backups]);
      setIsBackingUp(false);
      setShowCreateDialog(false);
      setBackupName('');
      setBackupNotes('');
      setBackupProgress(0);
      toast.success('Backup created successfully');
    }, 4000);
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    
    setIsRestoring(true);
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      setBackupProgress(100);
      setIsRestoring(false);
      setShowRestoreDialog(false);
      setBackupProgress(0);
      toast.success('Database restored successfully from backup');
    }, 6000);
  };

  const handleDeleteBackup = (backup: BackupRecord) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) return;
    setBackups(backups.filter(b => b.id !== backup.id));
    toast.success('Backup deleted');
  };

  const toggleTableSelection = (tableName: string) => {
    setTables(tables.map(t => 
      t.name === tableName ? { ...t, selected: !t.selected } : t
    ));
  };

  const selectAllTables = () => {
    setTables(tables.map(t => ({ ...t, selected: true })));
  };

  const deselectAllTables = () => {
    setTables(tables.map(t => ({ ...t, selected: false })));
  };

  const getStatusBadge = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Loader2 className="h-3 w-3 mr-1 animate-spin" />In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
    }
  };

  const getTypeBadge = (type: BackupRecord['type']) => {
    switch (type) {
      case 'full':
        return <Badge variant="secondary"><Database className="h-3 w-3 mr-1" />Full</Badge>;
      case 'incremental':
        return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1" />Incremental</Badge>;
      case 'selective':
        return <Badge variant="outline"><Table className="h-3 w-3 mr-1" />Selective</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Backup & Restore
          </h1>
          <p className="text-muted-foreground mt-1">Manage database backups and recovery</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScheduleDialog(true)} className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Download className="h-4 w-4" />
            Create Backup
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileArchive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Backups</p>
                <p className="text-2xl font-bold">{stats.totalBackups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="text-sm font-semibold">
                  {stats.lastBackup ? format(new Date(stats.lastBackup), 'MMM d, HH:mm') : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">{stats.totalSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduledBackups}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for automated backups */}
      {scheduleEnabled && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Automated Backups Active</AlertTitle>
          <AlertDescription>
            Full backups are scheduled {scheduleFrequency} at {scheduleTime}. Backups are retained for {retentionDays} days.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="backups">
        <TabsList>
          <TabsTrigger value="backups">Backup History</TabsTrigger>
          <TabsTrigger value="tables">Database Tables</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>View and manage all database backups</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileArchive className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{backup.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{format(new Date(backup.created_at), 'MMM d, yyyy HH:mm')}</span>
                            <span>•</span>
                            <span>{backup.size}</span>
                            <span>•</span>
                            <span>{backup.tables.length > 1 ? `${backup.tables.length} tables` : backup.tables[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getTypeBadge(backup.type)}
                        {getStatusBadge(backup.status)}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {backup.status === 'completed' && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedBackup(backup);
                                  setShowRestoreDialog(true);
                                }}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteBackup(backup)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>View table information and select for selective backup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAllTables}>Select All</Button>
                <Button variant="outline" size="sm" onClick={deselectAllTables}>Deselect All</Button>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {tables.map((table) => (
                    <div
                      key={table.name}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => toggleTableSelection(table.name)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={table.selected}
                          onCheckedChange={() => toggleTableSelection(table.name)}
                        />
                        <div className="p-2 rounded-lg bg-secondary">
                          <Table className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{table.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {table.rowCount.toLocaleString()} rows • {table.size}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Modified {format(new Date(table.lastModified), 'MMM d')}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>Configure automated backup schedule and retention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automated Backups</Label>
                  <p className="text-sm text-muted-foreground">Enable scheduled automatic backups</p>
                </div>
                <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time (24h)</Label>
                  <Input 
                    type="time" 
                    value={scheduleTime} 
                    onChange={(e) => setScheduleTime(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Retention (days)</Label>
                  <Select value={retentionDays} onValueChange={setRetentionDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full sm:w-auto" onClick={() => toast.success('Settings saved')}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Backup</DialogTitle>
            <DialogDescription>
              Configure and create a new database backup
            </DialogDescription>
          </DialogHeader>

          {isBackingUp ? (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Database className="h-16 w-16 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium">Creating backup...</p>
                <p className="text-sm text-muted-foreground">Please wait while we backup your data</p>
              </div>
              <Progress value={backupProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{Math.round(backupProgress)}%</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Backup Name (optional)</Label>
                <Input
                  placeholder="e.g., Pre-update backup"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Backup Type</Label>
                <Select value={backupType} onValueChange={(v: any) => setBackupType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Backup (All tables)</SelectItem>
                    <SelectItem value="incremental">Incremental (Changed data only)</SelectItem>
                    <SelectItem value="selective">Selective (Choose tables)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {backupType === 'selective' && (
                <div className="space-y-2">
                  <Label>Select Tables</Label>
                  <div className="text-sm text-muted-foreground mb-2">
                    {tables.filter(t => t.selected).length} tables selected
                  </div>
                  <ScrollArea className="h-48 border rounded-lg p-2">
                    {tables.map((table) => (
                      <div
                        key={table.name}
                        className="flex items-center gap-2 py-1.5 cursor-pointer"
                        onClick={() => toggleTableSelection(table.name)}
                      >
                        <Checkbox checked={table.selected} />
                        <span className="text-sm">{table.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{table.size}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="Add notes about this backup"
                  value={backupNotes}
                  onChange={(e) => setBackupNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {!isBackingUp && (
              <>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBackup} disabled={backupType === 'selective' && !tables.some(t => t.selected)}>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
            <DialogDescription>
              This will restore the database to the state from this backup
            </DialogDescription>
          </DialogHeader>

          {isRestoring ? (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-medium">Restoring database...</p>
                <p className="text-sm text-muted-foreground">Do not close this window</p>
              </div>
              <Progress value={backupProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{Math.round(backupProgress)}%</p>
            </div>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Restoring from backup will overwrite current data. Make sure to create a backup of the current state first.
                </AlertDescription>
              </Alert>

              {selectedBackup && (
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="font-medium">{selectedBackup.name}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Created: {format(new Date(selectedBackup.created_at), 'MMM d, yyyy HH:mm')}</p>
                    <p>Size: {selectedBackup.size}</p>
                    <p>Tables: {selectedBackup.tables.join(', ')}</p>
                  </div>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            {!isRestoring && (
              <>
                <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleRestore}>
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Database
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Schedule</DialogTitle>
            <DialogDescription>
              Configure automated backup schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Scheduled Backups</Label>
              <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input 
                type="time" 
                value={scheduleTime} 
                onChange={(e) => setScheduleTime(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label>Retention Period</Label>
              <Select value={retentionDays} onValueChange={setRetentionDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Keep for 7 days</SelectItem>
                  <SelectItem value="14">Keep for 14 days</SelectItem>
                  <SelectItem value="30">Keep for 30 days</SelectItem>
                  <SelectItem value="60">Keep for 60 days</SelectItem>
                  <SelectItem value="90">Keep for 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowScheduleDialog(false);
              toast.success('Backup schedule updated');
            }}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
