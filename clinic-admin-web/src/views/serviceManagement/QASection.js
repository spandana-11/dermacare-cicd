import React, { useState, useEffect } from 'react'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormInput,
  CButton,
  CInputGroup,
  CListGroup,
  CListGroupItem,
  CCol,
} from '@coreui/react'
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa'

const QASection = ({ title, qaList = [], setQAList }) => {
  const [question, setQuestion] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [answers, setAnswers] = useState([])
  const [modalMode, setModalMode] = useState('add') // default is add
  const [editingIndex, setEditingIndex] = useState(null) // track index when editing

  const addAnswer = () => {
    if (answerInput.trim() !== '') {
      setAnswers([...answers, answerInput])
      setAnswerInput('')
    }
  }

  const removeAnswer = (ans) => {
    setAnswers(answers.filter((a) => a !== ans))
  }

  const saveCurrentQA = () => {
    if (question.trim() && answers.length > 0) {
      const existingIndex = qaList.findIndex((qa) => Object.keys(qa)[0] === question)

      if (editingIndex !== null) {
        // If we are editing
        const updatedList = [...qaList]
        updatedList[editingIndex] = { [question]: answers }
        setQAList(updatedList)
        setEditingIndex(null)
      } else if (existingIndex !== -1) {
        // If question exists, update answers
        const updatedList = [...qaList]
        updatedList[existingIndex] = { [question]: answers }
        setQAList(updatedList)
      } else {
        // Add new question
        setQAList([...qaList, { [question]: answers }])
      }

      setQuestion('')
      setAnswers([])
    }
  }

  const editQA = (index) => {
    const qaItem = qaList[index]
    const q = Object.keys(qaItem)[0]
    const ans = qaItem[q]
    setQuestion(q)
    setAnswers(ans)
    setEditingIndex(index) // mark index as editing
  }

  const removeQA = (index) => {
    const updated = [...qaList]
    updated.splice(index, 1)
    setQAList(updated)
    // Reset editing if deleting the item being edited
    if (editingIndex === index) {
      setQuestion('')
      setAnswers([])
      setEditingIndex(null)
    }
  }

  useEffect(() => {
    if (qaList.length > 0) {
      const lastQA = qaList[qaList.length - 1] // or [0] depending on your UX
      const q = Object.keys(lastQA)[0]
      const ans = lastQA[q]
      setQuestion(q)
      setAnswers(ans)
    }
  }, [qaList])
  useEffect(() => {
    if ((modalMode === 'edit' || modalMode === 'view') && qaList.length > 0) {
      const lastQA = qaList[qaList.length - 1] // or [0] based on your UI
      const q = Object.keys(lastQA)[0]
      const ans = lastQA[q]
      setQuestion(q)
      setAnswers(ans)
    }
  }, [qaList, modalMode])

  return (
    <CCol md={12} className="mt-3">
      <label className="mb-2">Question</label>
      <CFormInput
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <label className="mt-3">Answers</label>
      <CInputGroup className="mb-2">
        <CFormInput
          placeholder="Enter answer"
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
        />
        <CButton color="success" onClick={addAnswer} className="text-white">
          <FaPlus />
        </CButton>
      </CInputGroup>

      {answers.length > 0 && (
        <CListGroup className="mb-3">
          {answers.map((ans, idx) => (
            <CListGroupItem key={idx} className="d-flex justify-content-between align-items-center">
              {ans}
              <div className="d-flex gap-2">
                <FaEdit
                  onClick={() => {
                    setAnswerInput(ans) // populate input for editing
                    removeAnswer(ans) // remove from current answers so it can be updated
                  }}
                  style={{ color: 'orange', cursor: 'pointer' }}
                  title="Edit Answer"
                />
                <FaTrash
                  onClick={() => removeAnswer(ans)}
                  style={{ color: 'red', cursor: 'pointer' }}
                  title="Delete Answer"
                />
              </div>
            </CListGroupItem>
          ))}
        </CListGroup>
      )}

      <CButton color="info" className="mb-3 text-white" onClick={saveCurrentQA}>
        {editingIndex !== null ? 'Update Q&A' : 'Save Q&A'}
      </CButton>

      {qaList.length > 0 && (
        <>
          <h6 className="mt-4">Saved Questions & Answers</h6>
          {qaList.map((qaItem, index) => {
            const questionText = Object.keys(qaItem)[0]
            const answerList = qaItem[questionText]
            return (
              <div key={index} className="mb-3">
                <strong>{questionText}</strong>
                <ul>
                  {answerList.map((ans, idx) => (
                    <li key={idx}>{ans}</li>
                  ))}
                </ul>
                <div className="d-flex gap-2">
                  <FaEdit
                    onClick={() => editQA(index)}
                    style={{ color: 'orange', cursor: 'pointer' }}
                    title="Edit Q&A"
                  />
                  <FaTrash
                    onClick={() => removeQA(index)}
                    style={{ color: 'red', cursor: 'pointer' }}
                    title="Delete Q&A"
                  />
                </div>
              </div>
            )
          })}
        </>
      )}
    </CCol>
  )
}

const ProcedureQA = ({
  preQAList,
  setPreQAList,
  procedureQAList,
  setProcedureQAList,
  postQAList,
  setPostQAList,
}) => {
  return (
    <CAccordion default>
      <CAccordionItem itemKey={1}>
        <CAccordionHeader>Pre-Procedure</CAccordionHeader>
        <CAccordionBody>
          <QASection title="Pre-Procedure" qaList={preQAList} setQAList={setPreQAList} />
        </CAccordionBody>
      </CAccordionItem>

      <CAccordionItem itemKey={2}>
        <CAccordionHeader>Procedure</CAccordionHeader>
        <CAccordionBody>
          <QASection title="Procedure" qaList={procedureQAList} setQAList={setProcedureQAList} />
        </CAccordionBody>
      </CAccordionItem>

      <CAccordionItem itemKey={3}>
        <CAccordionHeader>Post-Procedure</CAccordionHeader>
        <CAccordionBody>
          <QASection title="Post-Procedure" qaList={postQAList} setQAList={setPostQAList} />
        </CAccordionBody>
      </CAccordionItem>
    </CAccordion>
  )
}

export default ProcedureQA
