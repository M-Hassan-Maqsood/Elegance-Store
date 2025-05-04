import { CSVUpload } from "@/components/admin/csv-upload"

export default function ImportCSVPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Import Products from CSV</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Upload a CSV file to import or update product data
          </p>
        </div>

        <div className="mt-12 max-w-lg mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-6 space-y-1">
              <li>File must be in CSV format</li>
              <li>Required columns: ID, Product Name, Product Description, Price, Category</li>
              <li>Optional columns: Availability, Color, Img Path, Product Link, Sizes</li>
              <li>For image paths, use folder names that match product IDs</li>
              <li>Existing products will be updated if the ID already exists</li>
            </ul>

            <CSVUpload />
          </div>
        </div>
      </div>
    </div>
  )
}
