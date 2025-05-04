import Link from "next/link"
import { FileText, ImageIcon, Database, Upload, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Admin Dashboard</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Manage your products, images, and store settings
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* CSV Import Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">CSV Import</h2>
            </div>
            <p className="text-gray-600 mb-6">Import or update products from a CSV file</p>
            <Link href="/admin/import-csv">
              <Button className="w-full">Import CSV</Button>
            </Link>
          </div>

          {/* Folder Structure Upload Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Folder className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Folder Upload</h2>
            </div>
            <p className="text-gray-600 mb-6">Upload your entire product image folder structure</p>
            <Link href="/admin/folder-upload">
              <Button className="w-full">Upload Folders</Button>
            </Link>
          </div>

          {/* Image Upload Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <ImageIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Image Management</h2>
            </div>
            <p className="text-gray-600 mb-6">Upload and manage individual product images</p>
            <Link href="/admin/images">
              <Button className="w-full">Manage Images</Button>
            </Link>
          </div>

          {/* Bulk Upload Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Upload className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Bulk Upload</h2>
            </div>
            <p className="text-gray-600 mb-6">Upload multiple product images at once</p>
            <Link href="/admin/bulk-upload">
              <Button className="w-full">Bulk Upload</Button>
            </Link>
          </div>

          {/* Product Management Card */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Products</h2>
            </div>
            <p className="text-gray-600 mb-6">View, edit, and manage your products</p>
            <Link href="/admin/products">
              <Button className="w-full">Manage Products</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
