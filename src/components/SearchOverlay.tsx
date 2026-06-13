import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from './design/tokens'
import { calcCapabilityIndex, scoreToGrade } from '../types'

interface SearchResult {
  type: 'talent' | 'challenge'
  id: string
  title: string
  subtitle: string
}

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { state } = useApp()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    const talentResults: SearchResult[] = state.talents
      .filter(t =>
        t.name.includes(query) ||
        t.id.toLowerCase().includes(q) ||
        t.careerLabel.includes(query) ||
        Object.keys(t.currentSkills).some(s => s.includes(query))
      )
      .map(t => {
        const capIdx = calcCapabilityIndex(t.currentSkills)
        const grade = scoreToGrade(capIdx)
        return { type: 'talent' as const, id: t.id, title: t.name, subtitle: `${t.careerLabel} · ${grade}` }
      })

    const challengeResults: SearchResult[] = state.challenges
      .filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.role.includes(query)
      )
      .map(c => ({ type: 'challenge' as const, id: c.id, title: c.title, subtitle: `${c.role} · ${c.status === 'open' ? '进行中' : c.status === 'closing' ? '即将截止' : '已关闭'}` }))

    setResults([...talentResults, ...challengeResults].slice(0, 8))
    setSelectedIndex(0)
  }, [query, state.talents, state.challenges])

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    if (result.type === 'talent') {
      navigate(`/talent/${result.id}`)
    } else {
      navigate('/challenge')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'overlayIn 0.15s ease-out both',
        background: 'rgba(0, 0, 0, 0.35)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false)
      }}
    >
      <div style={{
        width: '90%',
        maxWidth: 540,
        background: COLORS.surface,
        border: BORDERS.standard,
        borderRadius: RADIUS.card,
        boxShadow: SHADOWS.toast,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: query ? `1px solid ${COLORS.divider}` : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>SEARCH</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索候选人、挑战... (姓名 / ID / 技能)"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.primary,
              background: 'transparent',
            }}
          />
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: COLORS.muted,
            letterSpacing: '0.05em',
            border: `1px solid ${COLORS.divider}`,
            borderRadius: RADIUS.tag,
            padding: '2px 6px',
          }}>
            Esc
          </span>
        </div>

        {results.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div
                key={`${r.type}-${r.id}`}
                onClick={() => handleSelect(r)}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: i === selectedIndex ? COLORS.bg : COLORS.surface,
                  borderBottom: `1px solid ${COLORS.divider}`,
                }}
              >
                <div>
                  <div style={{
                    fontFamily: FONTS.chinese,
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.primary,
                    marginBottom: 2,
                  }}>
                    {r.title}
                  </div>
                  <div style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    color: COLORS.muted,
                    letterSpacing: '0.05em',
                  }}>
                    {r.subtitle}
                  </div>
                </div>
                <span style={{
                  fontFamily: FONTS.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  color: COLORS.muted,
                  letterSpacing: '0.1em',
                  padding: '2px 6px',
                  border: `1px solid ${COLORS.divider}`,
                  borderRadius: RADIUS.tag,
                }}>
                  {r.type === 'talent' ? '人才' : '挑战'}
                </span>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            fontFamily: FONTS.chinese,
            fontSize: 13,
            color: COLORS.muted,
          }}>
            未找到匹配结果
          </div>
        )}

        {!query && (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            fontFamily: FONTS.chinese,
            fontSize: 12,
            color: COLORS.muted,
          }}>
            输入关键词搜索候选人姓名、ID、技能或挑战标题
          </div>
        )}
      </div>
    </div>
  )
}
