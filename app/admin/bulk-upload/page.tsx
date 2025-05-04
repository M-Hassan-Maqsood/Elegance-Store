import { BulkImageUpload } from "@/components/admin/bulk-image-upload"

export default function BulkUploadPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Bulk Image Upload</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">Upload multiple product images at once</p>
        </div>

        <div className="mt-12">
          <BulkImageUpload />
        </div>
      </div>
    </div>
  )
}
