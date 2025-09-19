'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  Text,
  Box,
  IconButton,
  Flex,
} from '@chakra-ui/react'
import Image from 'next/image'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

const socials = [
  { label: 'Whatsapp', icon: '/assets/icons/whatsapp.svg' },
  { label: 'Facebook', icon: '/assets/icons/facebook.svg' },
  { label: 'Threads', icon: '/assets/icons/threads.svg' },
  { label: 'Instagram', icon: '/assets/icons/instagram.svg' },
  { label: 'X', icon: '/assets/icons/X.svg' },
]

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onShareSuccess: () => void
}

export function ShareModal({
  isOpen,
  onClose,
  onShareSuccess,
}: ShareModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const scrollByAmount = 88

  const handleScroll = () => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 0)
    setShowRight(scrollLeft + clientWidth < scrollWidth)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return

    const amount = direction === 'right' ? scrollByAmount : -scrollByAmount
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })

    setTimeout(handleScroll, 50)
  }

  useEffect(() => {
    handleScroll()
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent
        borderRadius="lg"
        p={3}
        pr={5}
        bg="white"
        mt="auto"
        mb={112}
        mx={3}
        className="relative"
        overflow="auto"
      >
        <ModalBody p={0}>
          <Box overflowX="auto">
            <Flex
              gap={3}
              ref={scrollRef}
              onScroll={handleScroll}
              overflowX="auto"
              whiteSpace="nowrap"
            >
              {socials.map((platform, index) => (
                <Button
                  key={index}
                  variant="outline"
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  p={2.5}
                  gap={2.5}
                  minW="76px"
                  h="70px"
                  flexDirection="column"
                  _hover={{ bg: '#F1F4F8' }}
                  onClick={onShareSuccess}
                >
                  <Box boxSize={5}>
                    <Image
                      src={platform.icon}
                      alt={platform.label}
                      width={24}
                      height={24}
                    />
                  </Box>
                  <Text fontSize="xs" fontWeight={500} color="#9298B5">
                    {platform.label}
                  </Text>
                </Button>
              ))}
              {showRight && (
                <Box
                  bgGradient="linear-gradient(to-l, #fff 20%, transparent 100%)"
                  className="absolute w-[80px] h-full right-2 top-1/2 flex items-center justify-end -translate-y-1/2 mr-[1px]"
                >
                  <IconButton
                    w="44px"
                    h={8}
                    aria-label="Arrow Right"
                    icon={<ArrowRight size={18} />}
                    className="flex items-center justify-center"
                    rounded="md"
                    color="#131D53"
                    background="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    boxShadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset;"
                    onClick={() => scroll('right')}
                  />
                </Box>
              )}
              {showLeft && (
                <Box
                  bgGradient="linear-gradient(to-r, #fff 20%, transparent 100%)"
                  className="absolute w-[80px] h-full left-2 top-1/2 flex items-center justify-start -translate-y-1/2 ml-[1px]"
                >
                  <IconButton
                    w="44px"
                    h={8}
                    aria-label="Arrow Left"
                    icon={<ArrowLeft size={18} />}
                    className="flex items-center justify-center"
                    background="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    boxShadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset;"
                    rounded="md"
                    color="#131D53"
                    onClick={() => scroll('left')}
                  />
                </Box>
              )}
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
