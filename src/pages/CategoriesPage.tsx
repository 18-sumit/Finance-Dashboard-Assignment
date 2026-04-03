import { useState } from 'react';
import { useCategoryStore } from '../stores/categoryStore';
import { CategorySpec } from '../lib/categories';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import * as Icons from 'lucide-react';

export const CategoriesPage = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const role = useUIStore(s => s.role);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CategorySpec>>({
    label: '', iconName: 'HelpCircle', color: 'text-slate-500 bg-slate-100 dark:bg-slate-500/20'
  });

  const availableIcons = ['Coffee', 'Car', 'ShoppingBag', 'Film', 'HeartPulse', 'Zap', 'Briefcase', 'Laptop', 'TrendingUp', 'Home', 'GraduationCap', 'Plane', 'HelpCircle', 'Utensils', 'Wifi', 'Phone', 'Music', 'Gift', 'Book', 'Camera'];
  const colorPresets = [
    { label: 'Orange', value: 'text-orange-500 bg-orange-100 dark:bg-orange-500/20' },
    { label: 'Blue', value: 'text-blue-500 bg-blue-100 dark:bg-blue-500/20' },
    { label: 'Pink', value: 'text-pink-500 bg-pink-100 dark:bg-pink-500/20' },
    { label: 'Purple', value: 'text-purple-500 bg-purple-100 dark:bg-purple-500/20' },
    { label: 'Rose', value: 'text-rose-500 bg-rose-100 dark:bg-rose-500/20' },
    { label: 'Yellow', value: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20' },
    { label: 'Emerald', value: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20' },
    { label: 'Indigo', value: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-500/20' },
    { label: 'Teal', value: 'text-teal-500 bg-teal-100 dark:bg-teal-500/20' },
    { label: 'Cyan', value: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-500/20' },
  ];

  const handleOpen = (cat?: CategorySpec) => {
    if (cat) {
      setEditingId(cat.id);
      setFormData(cat);
    } else {
      setEditingId(null);
      setFormData({ label: '', iconName: 'HelpCircle', color: colorPresets[0].value });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.label) return;
    const id = editingId || formData.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const spec = { id, label: formData.label, iconName: formData.iconName!, color: formData.color! };
    
    if (editingId) updateCategory(editingId, spec);
    else addCategory(spec);
    
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage your custom spending and income categories.</p>
        </div>
        {role === 'admin' && (
          <Button onClick={() => handleOpen()}><Plus className="mr-2 h-4 w-4" /> New Category</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(categories).map(cat => (
          <Card key={cat.id} className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
            <CardContent className="flex items-center justify-between p-4">
               <CategoryIcon category={cat.id} />
               {role === 'admin' && (
                 <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={() => handleOpen(cat)}><Edit2 className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCategory(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                 </div>
               )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <input 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.label} 
                onChange={e => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g. Subscriptions" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <Select value={formData.iconName} onValueChange={(v) => setFormData({ ...formData, iconName: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {availableIcons.map(icon => {
                    const IconComp = (Icons as any)[icon];
                    return (
                      <SelectItem key={icon} value={icon}>
                         <div className="flex items-center gap-2"><IconComp className="h-4 w-4" /> {icon}</div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {colorPresets.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                       <div className="flex items-center gap-2">
                         <div className={`w-3 h-3 rounded-full ${c.value.split(' ')[0].replace('text-', 'bg-')}`} />
                         {c.label}
                       </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
