import { FolderStructureUpload } from "@/components/admin/folder-structure-upload"

export default function FolderUploadPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Folder Structure Upload</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Upload your entire product image folder structure at once
          </p>
        </div>

        <div className="mt-12">
          <FolderStructureUpload />
        </div>
      </div>
    </div>
  )
}
