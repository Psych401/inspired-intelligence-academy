'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export default function AddToCartButton({
  product,
  className = '',
  variant = 'default',
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (isInCart(product.id)) {
      return; // Already in cart
    }

    setLoading(true);
    
    // Simulate a brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    addToCart(product);
    setAdded(true);
    setLoading(false);

    // Reset the "added" state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  const baseClasses = 'flex items-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-brand-indigo text-white px-4 py-2 rounded-lg hover:bg-brand-blue',
    outline: 'border border-brand-indigo text-brand-indigo px-4 py-2 rounded-lg hover:bg-brand-indigo/10',
    ghost: 'text-brand-indigo px-4 py-2 rounded-lg hover:bg-gray-100',
  };

  const isAlreadyInCart = isInCart(product.id);

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || isAlreadyInCart}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          Adding...
        </>
      ) : added || isAlreadyInCart ? (
        <>
          <Check size={16} />
          {isAlreadyInCart ? 'In Cart' : 'Added!'}
        </>
      ) : (
        <>
          <ShoppingBag size={16} />
          Add to Cart
        </>
      )}
    </button>
  );
}

