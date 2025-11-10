'use client'

import { X, ArrowLeft, Copy } from 'lucide-react'
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  Textarea,
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import ImageUploadBox from './ImageUploadBox'
import TagsInputBox from './TagsInputBox'
import { useState } from 'react'
import { ShareModal } from './ShareModal'
import { SharedSuccessModal } from './SharedSuccessModal'

interface CreateLinkDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateLinkDrawer({ isOpen, onClose }: CreateLinkDrawerProps) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [suggestedText, setSuggestedText] = useState(
    '🔥 Promo boa demais pra deixar passar! Confere aí 👆'
  )

  function handleShareSuccess() {
    setIsShareOpen(false)
    setTimeout(() => {
      onClose()
      setTimeout(() => {
        setIsSuccessModalOpen(true)
        setStep('form')
      }, 200)
    }, 500)
  }

  return (
    <>
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent h="calc(100% - 100px)">
          <DrawerHeader
            borderBottomWidth={1}
            borderBottomColor="#DEE6F2"
            zIndex={1}
            p={3}
          >
            <Flex justify="space-between" align="center">
              {step === 'success' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStep('form')}
                  color="#131d53"
                  mr={2}
                  background="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  boxShadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset;"
                >
                  <ArrowLeft size={20} color="#131d53" />
                </Button>
              ) : (
                <Box display="none" />
              )}

              <Text fontSize="sm" mr="auto" color="#131d53" fontWeight={400}>
                Criar Link
              </Text>

              <Button
                onClick={onClose}
                w="44px"
                h="32px"
                background="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                boxShadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset;"
                borderRadius="md"
                p={0}
              >
                <X size={20} color="#131d53" />
              </Button>
            </Flex>
          </DrawerHeader>

          <DrawerBody bg={step === 'form' ? '#F4F6F9' : '#ffffff'} p={3}>
            {step === 'form' ? (
              <VStack spacing={4} align="stretch">
                <Box
                  bgColor="white"
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  borderRadius="md"
                  px={2}
                  pt={3}
                  pb={2}
                  boxShadow="0px 1px 1px 0px #000d3526"
                >
                  <Text
                    fontSize="sm"
                    pl={2}
                    fontWeight="semibold"
                    lineHeight="120%"
                    color="#131d53"
                    mb={3}
                  >
                    Nome do Link
                  </Text>
                  <Input
                    p={2}
                    placeholder="Adicione o título do seu link"
                    fontSize="sm"
                    border="1px solid #DEE6F2"
                    rounded={2}
                    _placeholder={{ color: '#131D5366', fontSize: 'sm' }}
                  />
                </Box>

                <Box
                  bg="white"
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  px={2}
                  pt={3}
                  pb={2}
                  boxShadow="0px 1px 1px 0px #000d3526"
                >
                  <Text
                    fontSize="sm"
                    pl={2}
                    fontWeight="semibold"
                    lineHeight="120%"
                    color="#131d53"
                    mb={3}
                  >
                    Link do Produto
                  </Text>
                  <HStack
                    h={10}
                    position="relative"
                    rounded={2}
                    borderWidth={1}
                    borderColor="#DEE6F2"
                    bgColor="#F3F7FB"
                    gap={0}
                    transition="all 0.2s"
                    _focusWithin={{
                      bgColor: '#F3F7FB',
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                      bg: 'white',
                    }}
                  >
                    <img
                      src="/assets/icons/link.svg"
                      className="max-w-[38px] w-[full] h-full p-2 bg-[#F3F7FB] border-r border-r-[#dee6f2]"
                    />

                    <Input
                      variant="unstyled"
                      bgColor="#F3F7FB"
                      p={2}
                      border={0}
                      placeholder="https://exemplo.com/minha-url"
                      fontSize="sm"
                      _placeholder={{ color: '#131D5366', fontSize: 'sm' }}
                    />
                  </HStack>
                </Box>

                <Box
                  bg="white"
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  px={2}
                  pt={3}
                  pb={2}
                  boxShadow="0px 1px 1px 0px #000d3526"
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text
                      fontSize="sm"
                      pl={2}
                      fontWeight="semibold"
                      lineHeight="120%"
                      color="#131d53"
                    >
                      Texto Sugerido
                    </Text>
                    <Button
                      variant="link"
                      fontSize="sm"
                      pr={2}
                      color="#FE5B80"
                      fontWeight="regular"
                      onClick={() => setSuggestedText('')}
                    >
                      Apagar
                    </Button>
                  </Flex>
                  <Textarea
                    rows={5}
                    value={suggestedText}
                    placeholder="Adicione uma descrição para o produto"
                    onChange={(e) => setSuggestedText(e.target.value)}
                    fontSize="sm"
                    color="#131d53"
                    letterSpacing="-0.15px"
                    lineHeight="18px"
                    border="1px solid #DEE6F2"
                    resize="none"
                    p={2}
                    rounded={2}
                    _placeholder={{ color: '#131D5366', fontSize: 'sm' }}
                  />
                </Box>

                <Box
                  bg="white"
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  px={2}
                  pt={3}
                  pb={2}
                  boxShadow="0px 1px 1px 0px #000d3526"
                >
                  <ImageUploadBox />
                </Box>

                <Box
                  bg="white"
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  px={2}
                  pt={3}
                  pb={2}
                  className="container-shadow"
                >
                  <TagsInputBox />
                </Box>
              </VStack>
            ) : (
              <VStack spacing={3}>
                <Stack spacing={3}>
                  <Flex
                    h="100%"
                    direction="column"
                    align="start"
                    justify="center"
                    gap={2}
                    px={2}
                  >
                    <Text fontSize="20px" color="#131d53" lineHeight="120%">
                      Seu link está pronto!
                    </Text>
                    <Text fontSize="sm" color="#131D5399" lineHeight={4}>
                      Copie o link abaixo ou escolha uma plataforma para
                      compartilhá-lo.
                    </Text>
                  </Flex>
                  <Flex
                    p={3}
                    gap={3}
                    direction="column"
                    justify="center"
                    align="center"
                    borderWidth={1}
                    borderColor="#DFEFFF"
                    bgColor="#EFF7FF"
                    rounded={4}
                  >
                    <Text
                      color="#1F70F1"
                      fontWeight="semibold"
                      fontSize="md"
                      w="fit-content"
                      alignSelf="center"
                    >
                      affi.ly/4jHX9IS
                    </Text>

                    <Button
                      fontSize="xs"
                      fontWeight="medium"
                      borderRadius="md"
                      h="full"
                      w="full"
                      maxW="139px"
                      color="#131D53"
                      background="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                      boxShadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset;"
                      px={3}
                      py={1.5}
                      display="flex"
                      gap={1.5}
                      alignContent="center"
                      justifyContent="center"
                    >
                      <Copy size={16} />
                      Copiar Link
                    </Button>
                  </Flex>
                </Stack>

                <Tabs color="#131d53" variant="unstyled" w="full">
                  <TabList maxH={8} bgColor="#E8EEF4" rounded={6}>
                    {['Detalhes', 'Produto', 'Marketing'].map((label, i) => (
                      <Tab
                        key={i}
                        fontSize="sm"
                        flex={1}
                        borderWidth={1}
                        borderColor="transparent"
                        px={3}
                        lineHeight="120%"
                        py={2}
                        color="#131D5399"
                        _selected={{
                          borderColor: '#C6D3E2',
                          bg: 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)',
                          rounded: 6,
                          color: '#131D53',
                        }}
                      >
                        {label}
                      </Tab>
                    ))}
                  </TabList>

                  <TabPanels>
                    <TabPanel px={0} pt={3} pb={0}>
                      <Box
                        borderWidth={1}
                        borderColor="#DBD8CD"
                        borderRadius="lg"
                        p={3}
                        backgroundImage="url('/assets/whatsapp-chat-bg.png')"
                        backgroundRepeat="no-repeat"
                        backgroundSize="cover"
                        backgroundPosition="center"
                      >
                        <VStack
                          bg="white"
                          rounded={4}
                          position="relative"
                          px={2}
                          pt={2}
                          pb={6}
                        >
                          <img
                            src="/assets/Tail.svg"
                            className="absolute -top-[1px] -left-[7px]"
                          />
                          <Flex
                            justify="center"
                            align="center"
                            maxH="158px"
                            overflow="hidden"
                            p={1}
                          >
                            <img
                              src="/assets/products/LegoPorche01.png"
                              className="h-[158px] w-auto"
                            />
                          </Flex>
                          <VStack p={1} align="start" gap={3}>
                            <Text
                              color="#284AFF"
                              fontSize="sm"
                              fontWeight="semibold"
                              decoration="underline"
                            >
                              http://affi.ly/4jHX9IS
                            </Text>
                            <Text fontSize="sm" color="#33383F">
                              🔥 Promo boa demais pra deixar passar! Confere aí
                              👆
                            </Text>
                          </VStack>
                          <Text
                            color="#0000007f"
                            style={{ fontFamily: 'SF Pro Text, sans-serif' }}
                            fontSize="xs"
                            className="absolute bottom-1 right-2"
                          >
                            16:30
                          </Text>
                        </VStack>
                      </Box>
                    </TabPanel>
                    <TabPanel px={0} pt={3} pb={0}>
                      <Box
                        borderWidth={1}
                        borderColor="#DEE6F2"
                        borderRadius="lg"
                        p={2}
                        className="container-shadow"
                      >
                        <Flex
                          justify="center"
                          align="center"
                          maxH="180px"
                          overflow="hidden"
                          p={1}
                        >
                          <img
                            src="/assets/products/LegoPorche02.png"
                            className="h-[180px] w-auto"
                          />
                        </Flex>
                        <VStack align="start" gap={4} mt={3}>
                          <HStack
                            bg="#C085FF4D"
                            py={0.5}
                            px={1}
                            rounded={4}
                            fontSize="xs"
                            fontWeight="semibold"
                            color="#2F0062"
                            gap={1}
                          >
                            <img
                              src="/assets/icons/extra-commission.svg"
                              alt=""
                              className="w-5 h-5"
                            />
                            <HStack gap={0}>
                              <Text fontWeight={300} textTransform="uppercase">
                                Comissão
                              </Text>
                              <Text fontWeight={800} textTransform="uppercase">
                                Extra
                              </Text>
                            </HStack>
                            <Text fontWeight={600}> 15%</Text>
                          </HStack>
                          <VStack align="start" gap={2}>
                            <Text fontSize="sm" color="#131D5399">
                              Lego Porsche 911 - Kit Construção
                            </Text>
                            <HStack gap={2}>
                              <Text
                                fontSize="md"
                                fontWeight={500}
                                color="#131d53"
                              >
                                R$ 1.234,89
                              </Text>
                              <HStack
                                gap={2}
                                bg="#9FFF854D"
                                px={2}
                                py={1.5}
                                fontSize="sm"
                                rounded={4}
                                color="#104C00"
                              >
                                <Text fontWeight={400}>Comissão Aprox.</Text>
                                <Text fontWeight={600}>R$203,11</Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Box>
                    </TabPanel>
                    <TabPanel px={0} pt={3} pb={0}></TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" px={3} pt={3} pb="42px" bg="white">
            {step === 'form' ? (
              <Button
                w="full"
                h={12}
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                color="#131d53"
                fontSize="sm"
                fontWeight="semibold"
                borderRadius="lg"
                onClick={() => setStep('success')}
              >
                Criar Link
              </Button>
            ) : (
              <Button
                w="full"
                h={12}
                background="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                boxShadow="0px 0px 0px 1px #0055F4 inset, 0px -1px 0px 0px #0038a94c inset, 0px 1px 1px 0px #ffffff99 inset;"
                color="#ffffff"
                fontSize="sm"
                fontWeight="semibold"
                border="1px solid #DEE6F2"
                borderRadius="lg"
                _hover={{
                  background:
                    'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)',
                }}
                onClick={() => setIsShareOpen(true)}
              >
                Copiar Link
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          onShareSuccess={handleShareSuccess}
        />
      </Drawer>
      <SharedSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  )
}
