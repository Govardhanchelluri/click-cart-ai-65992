-- Phase 1: Secure Order System
-- Deny users from inserting order_items directly (must go through Edge Function)
CREATE POLICY "Order items can only be created by server"
ON public.order_items
FOR INSERT
WITH CHECK (false);

-- Restrict order updates to prevent tampering (users cannot modify orders after creation)
CREATE POLICY "Users cannot update orders directly"
ON public.orders
FOR UPDATE
USING (false);

-- Phase 2: Data Privacy Controls
-- Allow users to delete their own profiles (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Allow users to delete their browsing history
CREATE POLICY "Users can delete their browsing history"
ON public.browsing_history
FOR DELETE
USING (auth.uid() = user_id);

-- Phase 4: Order Audit Trail
-- Create audit log table for order status changes
CREATE TABLE public.order_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  payment_transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.order_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs for their own orders
CREATE POLICY "Users can view their order audit logs"
ON public.order_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_audit_log.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Add payment verification fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order_id ON public.order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_payment ON public.orders(user_id, payment_verified);