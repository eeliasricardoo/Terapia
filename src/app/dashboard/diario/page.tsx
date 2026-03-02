"use client"

import { useDiary } from "./_hooks/use-diary"
import { DiaryHeader } from "./_components/diary-header"
import { DiaryForm } from "./_components/diary-form"
import { DiaryHistory } from "./_components/diary-history"

export default function DiarioPage() {
    const {
        selectedMood, setSelectedMood,
        selectedEmotions, toggleEmotion,
        content, setContent,
        entries, isLoading, isPending, DeletingId,
        handleSave, handleDelete,
        stats
    } = useDiary()

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <DiaryHeader
                entriesLength={entries.length}
                avgMood={stats.avgMood}
                commonEmotion={stats.commonEmotion}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                    <DiaryForm
                        selectedMood={selectedMood}
                        setSelectedMood={setSelectedMood}
                        selectedEmotions={selectedEmotions}
                        toggleEmotion={toggleEmotion}
                        content={content}
                        setContent={setContent}
                        handleSave={handleSave}
                        isPending={isPending}
                    />
                </div>

                <DiaryHistory
                    entries={entries}
                    isLoading={isLoading}
                    deletingId={DeletingId}
                    handleDelete={handleDelete}
                />
            </div>
        </div>
    )
}
