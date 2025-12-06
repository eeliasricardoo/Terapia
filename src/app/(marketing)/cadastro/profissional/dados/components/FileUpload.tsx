"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
    label: string
    acceptedTypes?: string
    maxSize?: string
    value?: File | null
    onChange?: (file: File | null) => void
}

export function FileUpload({ 
    label, 
    acceptedTypes = "PDF, PNG, or JPG", 
    maxSize = "MAX. 5MB",
    value,
    onChange 
}: FileUploadProps) {
    const [file, setFile] = useState<File | null>(value || null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile)
        onChange?.(selectedFile)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            handleFileChange(droppedFile)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        handleFileChange(selectedFile)
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`
                    relative flex flex-col items-center justify-center 
                    border-2 border-dashed rounded-md p-8 
                    transition-colors cursor-pointer
                    ${isDragging ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"}
                    ${file ? "bg-muted/50" : ""}
                `}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                    accept=".pdf,.png,.jpg,.jpeg"
                />
                {file ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{file.name}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleFileChange(null)
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {acceptedTypes} ({maxSize})
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}

