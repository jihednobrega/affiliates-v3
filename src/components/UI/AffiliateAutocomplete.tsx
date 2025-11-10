import { useState, useRef, useMemo } from 'react'
import {
  Box,
  Input,
  List,
  ListItem,
  HStack,
  Text,
  Avatar,
  useDisclosure,
  useOutsideClick,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react'

export interface AffiliateOption {
  id: number
  name: string
  avatar?: string
}

interface AffiliateAutocompleteProps {
  value: string
  onChange: (affiliateId: string, affiliateName: string) => void
  affiliates: AffiliateOption[]
  placeholder?: string
  label?: string
  isInvalid?: boolean
  errorMessage?: string
  isDisabled?: boolean
}

export function AffiliateAutocomplete({
  onChange,
  affiliates,
  placeholder = 'Digite o nome do afiliado',
  label = 'Afiliado *',
  isInvalid = false,
  errorMessage,
  isDisabled = false,
}: AffiliateAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
  })

  const filteredAffiliates = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...affiliates]
    }

    return affiliates.filter((affiliate) =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [affiliates, searchTerm])

  const handleSearch = (inputValue: string) => {
    setSearchTerm(inputValue)
    setSelectedName(inputValue)

    if (inputValue !== selectedName) {
      onChange('', '')
    }

    if (inputValue.trim() && affiliates.length > 0) {
      onOpen()
    } else {
      onClose()
    }
  }

  const handleSelect = (affiliate: AffiliateOption) => {
    onChange(String(affiliate.id), affiliate.name)
    setSelectedName(affiliate.name)
    setSearchTerm(affiliate.name)
    onClose()
  }

  const handleInputFocus = () => {
    if (affiliates.length > 0) {
      onOpen()
    }
  }

  return (
    <FormControl isInvalid={isInvalid} isDisabled={isDisabled}>
      <FormLabel fontSize="sm" color="#131D53" mb={2}>
        {label}
      </FormLabel>
      <Box position="relative" ref={dropdownRef}>
        <Input
          value={searchTerm || selectedName}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          borderColor="#DEE6F2"
          _hover={{ borderColor: '#C5CDDC' }}
          _focus={{
            borderColor: '#1F70F1',
            boxShadow: '0 0 0 1px #1F70F1',
          }}
        />

        {isOpen && filteredAffiliates.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={1000}
            bg="white"
            border="1px solid"
            borderColor="#DEE6F2"
            borderRadius="md"
            maxH="240px"
            overflowY="auto"
            boxShadow="lg"
            mt={1}
          >
            <List spacing={0}>
              {filteredAffiliates.slice(0, 10).map((affiliate) => (
                <ListItem
                  key={affiliate.id}
                  px={3}
                  py={2.5}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: '#F3F6FA',
                  }}
                  onClick={() => handleSelect(affiliate)}
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={affiliate.name}
                      src={affiliate.avatar}
                    />
                    <Text fontSize="sm" color="#131D53">
                      {affiliate.name}
                    </Text>
                  </HStack>
                </ListItem>
              ))}

              {filteredAffiliates.length > 10 && (
                <ListItem
                  px={3}
                  py={2}
                  fontSize="xs"
                  color="#131D5399"
                  textAlign="center"
                  borderTop="1px solid #DEE6F2"
                >
                  E mais {filteredAffiliates.length - 10} resultados...
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </Box>

      {isInvalid && errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
    </FormControl>
  )
}
