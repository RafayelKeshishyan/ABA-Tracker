import { useState } from 'react'
import { useRecording } from '../hooks/useRecording'
import { TranscriptionModal } from './TranscriptionModal'

export function RecordingButton({ onParsedData }) {
  const { isRecording, formattedTime, startRecording, stopRecording } = useRecording()
  const [showModal, setShowModal] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)

  const handleStart = async () => {
    try {
      await startRecording()
    } catch (error) {
      alert('Could not access microphone. Please allow microphone access.')
    }
  }

  const handleStop = async () => {
    const blob = await stopRecording()
    if (blob) {
      setAudioBlob(blob)
      setShowModal(true)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setAudioBlob(null)
  }

  const handleParsedData = (data) => {
    onParsedData(data)
    handleModalClose()
  }

  return (
    <>
      {!isRecording ? (
        <button type="button" className="btn record-btn" onClick={handleStart}>
          🎤 Record Incident
        </button>
      ) : (
        <button type="button" className="btn record-btn recording" onClick={handleStop}>
          ⏹️ Stop Recording ({formattedTime})
        </button>
      )}

      {showModal && (
        <TranscriptionModal
          audioBlob={audioBlob}
          onClose={handleModalClose}
          onParsedData={handleParsedData}
        />
      )}
    </>
  )
}
