import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Text,
  Box,
  Image,
  Button,
  VStack,
  Flex,
  HStack,
} from '@chakra-ui/react'
import { ExternalLink, FileText } from 'lucide-react'

export interface DocumentItem {
  url: string | null
  title: string
  isAvailable?: boolean
}

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string | null
  documentTitle: string
  documents?: DocumentItem[]
  currentIndex?: number
  onNavigate?: (index: number) => void
}

export function DocumentViewer({
  isOpen,
  onClose,
  documentUrl,
  documentTitle,
  documents = [],
  currentIndex = 0,
  onNavigate,
}: DocumentViewerProps) {
  const currentDoc = documents[currentIndex]
  const isDocumentAvailable = currentDoc?.isAvailable !== false && !!documentUrl

  const isPdf = documentUrl?.toLowerCase().endsWith('.pdf') || false
  const hasNavigation = documents.length > 1 && onNavigate

  const handleExternal = () => {
    if (!documentUrl) return
    window.open(documentUrl, '_blank')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="1200px">
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="600" color="#131D53">
              {documentTitle}
            </Text>
            <Button
              size="sm"
              leftIcon={<ExternalLink size={16} />}
              onClick={handleExternal}
              colorScheme="blue"
              variant="outline"
            >
              Abrir em nova guia
            </Button>
          </Flex>
        </ModalHeader>

        <ModalBody pb={6}>
          <HStack spacing={4} align="start" w="full">
            {hasNavigation && (
              <VStack
                spacing={2}
                w="250px"
                flexShrink={0}
                align="start"
                bg="#F3F6FA"
                p={3}
                borderRadius="8px"
                maxH="600px"
                overflowY="auto"
              >
                <Text fontSize="xs" fontWeight="600" color="#131D5399" mb={1}>
                  DOCUMENTOS
                </Text>
                {documents.map((doc, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="ghost"
                    justifyContent="flex-start"
                    w="full"
                    leftIcon={<FileText size={16} />}
                    onClick={() => onNavigate && onNavigate(index)}
                    bg={index === currentIndex ? 'white' : 'transparent'}
                    color={
                      doc.isAvailable === false
                        ? '#131D5366'
                        : index === currentIndex
                        ? '#1F70F1'
                        : '#131D53'
                    }
                    fontWeight={index === currentIndex ? '600' : '400'}
                    _hover={{
                      bg:
                        doc.isAvailable === false
                          ? 'transparent'
                          : index === currentIndex
                          ? 'white'
                          : '#E8F0FE',
                    }}
                    fontSize="xs"
                    h="auto"
                    py={2}
                    px={3}
                    textAlign="left"
                    whiteSpace="normal"
                    border={
                      index === currentIndex
                        ? '1px solid #1F70F1'
                        : '1px solid transparent'
                    }
                    isDisabled={doc.isAvailable === false}
                    opacity={doc.isAvailable === false ? 0.5 : 1}
                    cursor={
                      doc.isAvailable === false ? 'not-allowed' : 'pointer'
                    }
                  >
                    {doc.title}
                  </Button>
                ))}
              </VStack>
            )}

            <Box
              flex="1"
              h="600px"
              bg="#F3F6FA"
              borderRadius="8px"
              overflow="hidden"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {!isDocumentAvailable ? (
                <VStack spacing={3}>
                  <FileText size={48} color="#131D5399" />
                  <Text fontSize="md" color="#131D5399" fontWeight="500">
                    Documento não disponível
                  </Text>
                  <Text fontSize="sm" color="#131D5399">
                    Este documento ainda não foi enviado
                  </Text>
                </VStack>
              ) : isPdf && documentUrl ? (
                <Box w="full" h="full">
                  <iframe
                    src={documentUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title={documentTitle}
                  />
                </Box>
              ) : documentUrl ? (
                <Image
                  src={documentUrl}
                  alt={documentTitle}
                  maxW="100%"
                  maxH="100%"
                  objectFit="contain"
                />
              ) : null}
            </Box>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
