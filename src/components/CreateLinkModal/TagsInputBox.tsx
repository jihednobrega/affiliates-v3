'use client'

import {
  Box,
  Input,
  Text,
  HStack,
  VStack,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  TagRightIcon,
} from '@chakra-ui/react'
import { Info, X } from 'lucide-react'
import { useState } from 'react'
import { OfferIcon } from '../CustomIcons'
import { useOutsideClick } from '@chakra-ui/react'
import { useRef } from 'react'

export default function TagsInputBox() {
  const [tags, setTags] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const tagsRef = useRef(null)

  useOutsideClick({
    ref: tagsRef,
    handler: () => {
      setSelectedTag(null)
    },
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()])
      }
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <VStack ref={tagsRef} align="stretch" gap={0}>
      <Text
        fontSize="sm"
        pl={2}
        fontWeight="semibold"
        lineHeight="120%"
        color="#131d53"
        mb={3}
      >
        Tags
      </Text>

      <HStack
        h={10}
        position="relative"
        rounded={2}
        borderWidth={1}
        borderColor="#DEE6F2"
        gap={0}
        transition="all 0.2s"
        _focusWithin={{
          borderColor: '#1F70F1',
          boxShadow: '0 0 0 1px #1F70F1',
          bg: 'white',
        }}
      >
        <HStack
          justify="center"
          p={2}
          w="38px"
          h="38px"
          borderRightWidth={1}
          borderRightColor="#dee6f2"
        >
          <OfferIcon color="#131D53" />
        </HStack>
        <Box overflowX="auto" rounded={6} flex="1">
          <HStack wrap="nowrap" spacing={1}>
            {tags.map((tag, idx) => (
              <Tag
                key={idx}
                size="md"
                rounded={4}
                bgColor="#EBF2FF"
                borderWidth={1}
                borderColor="#B2D0FF"
                color="#1F70F1"
                flexShrink="0"
                className="first:ml-2"
                overflowX="auto"
                onClick={() => {
                  setSelectedTag((prev) => (prev === tag ? null : tag))
                }}
              >
                <TagLabel>{tag}</TagLabel>
                {selectedTag === tag && (
                  <TagRightIcon
                    boxSize="20px"
                    as={X}
                    transition="all 0.2s ease"
                    ml={2}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTag(tag)
                      setSelectedTag(null)
                    }}
                  />
                )}
              </Tag>
            ))}

            <Input
              p={2}
              variant="unstyled"
              placeholder="Adicione as tags do seu link"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rounded={2}
              border="none"
              flex="1"
              minW="fit-content"
              _placeholder={{ color: '#131D5366', fontSize: 'sm' }}
            />
          </HStack>
        </Box>
      </HStack>

      <Box
        p={2}
        borderWidth={1}
        borderColor="#DBE1EA"
        rounded={4}
        bgColor="#F4F6F9"
        mt={4}
      >
        <Box display="flex" gap={1} mt={1}>
          <Info color="#131D5399" size={16} />
          <Text lineHeight={4} fontSize="sm" color="#131D5399" flex={1}>
            As tags ajudam no gerenciamento dos seus links, categorize links por
            categorias ou da forma que preferir
          </Text>
        </Box>
      </Box>
    </VStack>
  )
}
