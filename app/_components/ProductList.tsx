import Image from "next/image";
import Link from "next/link";
import db from "../_lib/db";
import { auth } from "../../auth";
import AddProductModal from "./AddProductModal";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  category: string | null;
  description: string | null;
};

export default async function ProductsList({ category }: { category?: string }) {
  const session = await auth();
  const role = session?.user?.role;
  const isAdmin = role === 1;

  const [result, categoryResult] = await Promise.all([
    db.query<Product>(
      `SELECT id, name, slug, price, image_url, category, description
       FROM products
       WHERE is_active = true
         AND ($1::text IS NULL OR category = $1)
       ORDER BY created_at DESC`,
      [category || null]
    ),
    db.query<{ category: string }>(
      `SELECT DISTINCT category
       FROM products
       WHERE is_active = true AND category IS NOT NULL
       ORDER BY category ASC`
    ),
  ]);

  const products = result.rows;
  const categories = categoryResult.rows;

  return (
    <div>
      {category && (
        <Link
          href="/"
          className="mb-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          &larr; Back to all products
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Products</h2>
        <div className="flex items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            <label htmlFor="category" className="sr-only">Filter by category</label>
            <select
              id="category"
              name="category"
              defaultValue={category ?? ""}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.category} value={item.category}>
                  {item.category}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Filter
            </button>
          </form>
          {isAdmin && <AddProductModal />}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          No products available right now.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="group min-w-0 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-3 space-y-1">
                  {product.category && (
                    <span className="inline-block text-[11px] font-medium uppercase tracking-wide text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {product.category}
                    </span>
                  )}

                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <p className="pt-1 text-base font-bold text-gray-900">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </Link>

              <div className="flex gap-2 px-3 pb-3">
                {isAdmin ? (
                  <>
                    <EditButton product={product} />
                    <DeleteButton id={product.id} />
                  </>
                ) : (
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex-1 text-sm font-medium text-center text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}