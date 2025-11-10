import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Heading,
  Icon,
  Skeleton,
  SkeletonText,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Select,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import { Info, Send, Search } from 'lucide-react'
import { api } from '@/utils/api'

interface FAQItem {
  id: number
  question: string
  answer: string
  position: number
}

interface FAQResponse {
  success: boolean
  data: {
    list: FAQItem[]
    meta: {
      current_page: number
      last_page: number
      total_items: number
      pagesize: number
    }
  }
}

export default function BrandSupport() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  })

  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const fetchFAQs = useCallback(async () => {
    try {
      const { data } = await api<FAQResponse>({
        url: '/brands/faq',
        method: 'GET',
      })

      if (data.success && data.data?.list) {
        const sortedFAQs = data.data.list.sort(
          (a, b) => a.position - b.position
        )
        setFaqs(sortedFAQs)
      }
    } catch (error) {
      console.error('Erro ao carregar FAQs:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as perguntas frequentes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoadingFAQs(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFAQs()
  }, [fetchFAQs])

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const supportOptions = [
    {
      title: 'Sugestão de Melhorias',
      questions: [{ id: 0, message: '' }],
    },
    {
      title: 'Suporte Técnico',
      questions: [
        { id: 1, message: 'Erros na Plataforma' },
        { id: 2, message: 'Dificuldades com a Ferramenta de Relatórios' },
        { id: 3, message: 'Questões de Compatibilidade (App/Dispositivo)' },
      ],
    },
    {
      title: 'Vendas e Comissões',
      questions: [
        { id: 4, message: 'Dúvidas sobre Comissão' },
        { id: 5, message: 'Problemas com Pagamentos' },
        { id: 6, message: 'Relatório de Vendas Inconsistente' },
        { id: 7, message: 'Status de Vendas Pendentes' },
      ],
    },
    {
      title: 'Marketing e Divulgação',
      questions: [
        { id: 8, message: 'Acesso a Materiais de Divulgação' },
        { id: 9, message: 'Perguntas sobre Boas Práticas de Marketing' },
        { id: 10, message: 'Como Melhorar Meus Resultados' },
        { id: 11, message: 'Dúvidas sobre Links de Afiliação' },
        { id: 12, message: 'Sugestões de Ferramentas de Divulgação' },
      ],
    },
    {
      title: 'Treinamento e Recursos',
      questions: [
        { id: 13, message: 'Dúvidas sobre Cursos' },
        { id: 14, message: 'Guia de Iniciantes do Programa de Afiliados' },
        { id: 15, message: 'Acesso à Central dos Afiliados' },
        { id: 16, message: 'Material de Apoio e Tutoriais' },
      ],
    },
    {
      title: 'Outros',
      questions: [{ id: 17, message: '' }],
    },
  ]

  const handleSubmitContact = async () => {
    if (!formData.subject || !formData.message) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione o assunto e descreva sua dúvida',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await api<{
        success: boolean
        message: string
        data?: any
      }>({
        url: '/contact',
        method: 'POST',
        data: {
          subject: formData.subject,
          message: formData.message,
        },
      })

      if (data.success) {
        toast({
          title: 'Ticket enviado!',
          description:
            'Sua mensagem foi enviada com sucesso. Nossa equipe entrará em contato em breve.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        setFormData({ subject: '', message: '' })
      } else {
        throw new Error(data.message || 'Erro desconhecido')
      }
    } catch (error: any) {
      console.error('Erro ao enviar contato:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Não foi possível enviar sua mensagem. Tente novamente.'

      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Suporte | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <Info size={24} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Suporte
            </Text>
          </Flex>
        </PageHeader>

        <PageContent>
          <VStack spacing={2.5} align="stretch">
            {/* Contact Form */}
            <Box>
              <Card bg="white" borderColor="#DEE6F2">
                <CardBody p={3}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel
                        pl={2}
                        color="#131D53"
                        fontWeight="normal"
                        fontSize="xs"
                      >
                        Sobre qual assunto deseja falar?
                      </FormLabel>
                      <Select
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange('subject', e.target.value)
                        }
                        placeholder="Selecione o assunto"
                        borderColor="#DEE6F2"
                        borderRadius="6px"
                        fontSize="sm"
                        _focus={{
                          borderColor: '#1F70F1',
                          boxShadow: '0 0 0 1px #1F70F1',
                        }}
                        bg="white"
                      >
                        {supportOptions.map(({ title, questions }) => {
                          return questions.map(({ id, message }) => (
                            <option key={id} value={`${title} - ${message}`}>
                              {`${title}${message ? ` - ${message}` : ''}`}
                            </option>
                          ))
                        })}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel
                        pl={2}
                        color="#131D53"
                        fontWeight="normal"
                        fontSize="xs"
                      >
                        Faça um breve relato sobre o assunto
                      </FormLabel>
                      <Textarea
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange('message', e.target.value)
                        }
                        placeholder="Descreva sua dúvida ou problema com detalhes..."
                        rows={5}
                        borderColor="#DEE6F2"
                        borderRadius="6px"
                        fontSize="sm"
                        _focus={{
                          borderColor: '#1F70F1',
                          boxShadow: '0 0 0 1px #1F70F1',
                        }}
                        resize="vertical"
                        bg="white"
                      />
                    </FormControl>

                    <Button
                      onClick={handleSubmitContact}
                      isLoading={isSubmitting}
                      loadingText="Enviando..."
                      rounded={6}
                      h={8}
                      fontSize="xs"
                      fontWeight={600}
                      px={3}
                      color="#fff"
                      bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                      shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                      _hover={{
                        bgGradient:
                          'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                      }}
                      transition="all 0.2s ease"
                      leftIcon={<Icon as={Send} />}
                      w={{ base: 'full', md: 'auto' }}
                      alignSelf={{ base: 'stretch', md: 'flex-end' }}
                    >
                      Enviar ticket
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* FAQ Search - Só exibe se houver FAQs ou estiver carregando */}
            {(isLoadingFAQs || faqs.length > 0) && (
              <Card bg="white" borderColor="#DEE6F2">
                <CardBody p={3}>
                  <Flex align="center" gap={3} mb={4}>
                    <Heading
                      px={3}
                      fontWeight={400}
                      fontSize="sm"
                      color="#131D53"
                    >
                      Perguntas Frequentes
                    </Heading>
                  </Flex>

                  {isLoadingFAQs ? (
                    <VStack spacing={4}>
                      {[...Array(5)].map((_, i) => (
                        <Box
                          key={i}
                          w="full"
                          p={4}
                          border="1px solid"
                          borderColor="#DEE6F2"
                          borderRadius="6px"
                          bg="white"
                        >
                          <SkeletonText
                            noOfLines={1}
                            spacing={4}
                            skeletonHeight={4}
                          />
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Accordion allowToggle>
                      {filteredFAQs.map((faq) => (
                        <AccordionItem
                          key={faq.id}
                          border="1px solid"
                          borderColor="#DEE6F2"
                          borderRadius="6px"
                          mb={3}
                          bg="white"
                        >
                          <AccordionButton
                            py={2}
                            px={4}
                            _hover={{ bg: 'gray.50' }}
                            borderRadius="6px"
                          >
                            <Box flex="1" textAlign="left">
                              <Text
                                fontWeight="medium"
                                fontSize="xs"
                                color="#131D53"
                              >
                                {faq.question}
                              </Text>
                            </Box>
                            <AccordionIcon color="#131D53" />
                          </AccordionButton>
                          <AccordionPanel
                            py={2}
                            px={6}
                            borderTop="1px solid"
                            borderColor="#DEE6F2"
                          >
                            <Text
                              color="#131D5399"
                              lineHeight="1.6"
                              fontSize="sm"
                            >
                              {faq.answer}
                            </Text>
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}

                  {filteredFAQs.length === 0 && searchTerm && (
                    <Box
                      bg="gray.50"
                      borderRadius="6px"
                      p={8}
                      textAlign="center"
                    >
                      <Icon as={Search} boxSize={8} color="gray.400" mb={3} />
                      <Text color="gray.600" fontSize="xs">
                        Nenhuma pergunta encontrada para "{searchTerm}"
                      </Text>
                      <Text fontSize="xs" color="gray.500" mt={2}>
                        Envie um ticket com sua dúvida acima
                      </Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            )}
          </VStack>
        </PageContent>
      </AppLayout>
    </>
  )
}
