// Páginas públicas del módulo Catalog
export { BrandsListPage } from './pages/BrandsListPage';
export { CategoriesListPage } from './pages/CategoriesListPage';
export { ProductsListPage } from './pages/ProductsListPage';
export { ProductFormPage } from './pages/ProductFormPage';

// Hooks públicos (queries)
export { useBrands, useBrand } from './hooks/useBrands';
export { useCategories, useRootCategories, useSubcategories, useCategory } from './hooks/useCategories';
export { useProducts, useFeaturedProducts, useProductsByCategory, useProductsByBrand, useProduct } from './hooks/useProducts';
export { useVariants, useVariantsByProduct, useActiveVariantsByProduct, useVariant } from './hooks/useVariants';
export { useImagesByProduct, useImagesByVariant, useImage } from './hooks/useImages';

// Hooks de mutaciones
export { useCreateBrand, useUpdateBrand, useDeleteBrand, useToggleBrandStatus } from './hooks/useBrands';
export { useCreateCategory, useUpdateCategory, useDeleteCategory, useToggleCategoryStatus } from './hooks/useCategories';
export { useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductStatus } from './hooks/useProducts';
export { useCreateVariant, useUpdateVariant, useDeleteVariant, useToggleVariantStatus } from './hooks/useVariants';
export { useCreateImage, useUpdateImage, useDeleteImage } from './hooks/useImages';

// Componentes
export { BrandFormModal } from './components/BrandFormModal';
export { CategoryFormModal } from './components/CategoryFormModal';
export { ProductFormModal } from './components/ProductFormModal';

