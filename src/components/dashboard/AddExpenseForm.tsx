
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import ReceiptUpload from './ReceiptUpload';

type ExpenseCategory = Database['public']['Enums']['expense_category'];

interface AddExpenseFormProps {
  onClose: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onClose }) => {
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachment, setAttachment] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const categories: ExpenseCategory[] = [
    'Food', 'Travel', 'Utilities', 'Entertainment', 
    'Healthcare', 'Shopping', 'Education', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          expense_name: expenseName,
          amount: parseFloat(amount),
          category: category,
          date,
          attachment: attachment || null
        });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Expense added successfully!",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">Add New Expense</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 text-center">
        <div className="space-y-2">
          <Label htmlFor="expenseName" className="block text-center">Expense Name</Label>
          <Input
            id="expenseName"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            placeholder="e.g., Coffee at Starbucks"
            required
            className="text-center"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="block text-center">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="text-center"
          />
        </div>

        <div className="space-y-2">
          <Label className="block text-center">Category</Label>
          <Select value={category} onValueChange={(value: ExpenseCategory) => setCategory(value)} required>
            <SelectTrigger className="text-center">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-center">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="block text-center">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="text-center"
          />
        </div>

        <div className="space-y-2">
          <Label className="block text-center">Receipt (Optional)</Label>
          <div className="flex justify-center">
            <ReceiptUpload onUploadComplete={(url) => setAttachment(url)} />
          </div>
          {attachment && (
            <p className="text-sm text-green-600 text-center">Receipt uploaded!</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddExpenseForm;
