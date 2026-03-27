'use client'

import { useDiary } from './_hooks/use-diary'
import { DiaryHeader } from './_components/diary-header'
import { DiaryForm } from './_components/diary-form'
import { DiaryHistory } from './_components/diary-history'

export default function DiarioPage() {
  const {
    selectedMood,
    setSelectedMood,
    selectedEmotions,
    toggleEmotion,
    content,
    setContent,
    entries,
    isLoading,
    isPending,
    DeletingId,
    handleSave,
    handleDelete,
    stats,
  } = useDiary()

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 px-4">
      <DiaryHeader
        entriesLength={entries.length}
        avgMood={stats.avgMood}
        commonEmotion={stats.commonEmotion}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
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

        <div className="lg:sticky lg:top-8">
          <DiaryHistory
            entries={entries}
            isLoading={isLoading}
            deletingId={DeletingId}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
