import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { Product, Collection, Category, Service, Testimonial, PortfolioItem } from './types';

export function useProducts(filters?: {
  category?: string;
  collection?: string;
  search?: string;
  sort?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('products')
      .select('*, categories(*), collections(*), product_sizes(*), product_colours(*)');

    if (filters?.category) {
      query = query.eq('categories.slug', filters.category);
    }
    if (filters?.collection) {
      query = query.eq('collections.slug', filters.collection);
    }
    if (filters?.isNew) {
      query = query.eq('is_new', true);
    }
    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    switch (filters?.sort) {
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  }, [filters?.category, filters?.collection, filters?.search, filters?.sort, filters?.isNew, filters?.isFeatured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('products')
        .select('*, categories(*), collections(*), product_sizes(*), product_colours(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (err) {
        setError(err.message);
      } else {
        setProduct(data as Product | null);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  return { product, loading, error };
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setCollections(data as Collection[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return { collections, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (data) setCategories(data as Category[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return { categories, loading };
}

export function useSiteContent(section: string) {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from('site_content')
        .select('data')
        .eq('section', section)
        .maybeSingle();
      setData((row as any)?.data ?? null);
      setLoading(false);
    };
    fetch();
  }, [section]);

  return { data, loading };
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setServices(data as Service[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return { services, loading };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setTestimonials(data as Testimonial[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return { testimonials, loading };
}

export function usePortfolioItems() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setItems(data as PortfolioItem[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return { items, loading };
}
