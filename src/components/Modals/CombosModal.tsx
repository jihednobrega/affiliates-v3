import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Button,
  Box,
} from '@chakra-ui/react'
import { Combo } from '../../types/missions'
import { Flame, Zap } from 'lucide-react'

interface CombosModalProps {
  isOpen: boolean
  onClose: () => void
  combo: Combo | null
}

export const CombosModal: React.FC<CombosModalProps> = ({
  isOpen,
  onClose,
  combo,
}) => {
  if (!combo) return null

  const progressPercentage = (combo.streakDays / combo.totalDays) * 100
  const remainingDays = combo.totalDays - combo.streakDays

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs" isCentered>
      <ModalOverlay />
      <ModalContent rounded={20}>
        <ModalHeader borderBottomWidth={1} borderBottomColor="#DEE6F2" p={3}>
          <HStack
            p={3}
            bgGradient="linear-gradient(110deg, #F66B27 -4.7%, #FF4F46 106.4%)"
            border="1px solid #FF9E93"
            rounded={12}
            gap={3}
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '50%',
              backgroundImage: `url(/assets/mission-combos-bg-icon.svg)`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center right',
              backgroundSize: 'cover',
              opacity: 1,
              pointerEvents: 'none',
            }}
          >
            <Box
              w="36px"
              h="36px"
              bg="#D63925"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Flame size={20} color="white" />
            </Box>
            <VStack align="start" gap={1} color="white">
              <Text fontSize="xs" fontWeight={400} lineHeight={4}>
                Você está vendendo há:
              </Text>
              <Text fontSize="md" fontWeight={600} lineHeight={4}>
                14 dias
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>

        <ModalBody p={3}>
          <VStack align="stretch" spacing={3}>
            <Box position="relative">
              <Box p={1} bg="#FFE2DD" rounded="full">
                <Progress
                  value={progressPercentage}
                  size="lg"
                  h="20px"
                  borderRadius="full"
                  bg="#DF422C"
                  sx={{
                    '& > div': {
                      position: 'relative',
                      border: '1px solid #FF9E93',
                      background:
                        'linear-gradient(110deg, #F66B27 -4.7%, #FF4F46 106.4%)',
                    },
                  }}
                />
              </Box>
              <Text
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="sm"
                fontWeight="semibold"
                color="white"
                textShadow="0 1px 2px rgba(0,0,0,0.1)"
              >
                {combo.streakDays}
              </Text>
            </Box>

            <HStack justify="space-between" px={1}>
              <Text fontSize="sm" color="#131D5399">
                Faltam
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="#131D53">
                {remainingDays} dias
              </Text>
            </HStack>

            <VStack px={1} align="start">
              <Text fontSize="sm" color="#131D5399">
                a cada 60 dias resgate um boost de:
              </Text>
              <Badge
                rounded={4}
                bg="#C085FF4D"
                px={1}
                py={0.5}
                display="flex"
                alignItems="center"
                gap="4px"
                w="fit-content"
                mt="2px"
              >
                <Zap size={16} color="#2F0062" />
                <Text
                  color="#2F0062"
                  fontSize="14px"
                  fontWeight={300}
                  textTransform="initial"
                  lineHeight="14.4px"
                >
                  +{combo.commission}% Comissão {combo.duration} dias
                </Text>
              </Badge>
            </VStack>

            <Button
              size="md"
              w="full"
              rounded={8}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1.5}
              fontSize="sm"
              color="#9854F5"
              bgGradient="linear-gradient(180deg, #F9F5FE 47.86%, #EAD5FF 123.81%)"
              shadow="0px 0px 0px 1px #C099FF inset, 0px 0px 0px 2px #FFF inset"
              className="border border-transparent disabled:border-[#9854F5] disabled:pointer-events-none"
              disabled
            >
              Resgatar Boost
              <Zap size={24} color="#9854F5" />
            </Button>
          </VStack>
        </ModalBody>

        <ModalFooter p={3} borderTopWidth={1} borderTopColor="#DEE6F2">
          <Button
            w="full"
            size="md"
            fontSize="sm"
            fontWeight={400}
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
          >
            Ver detalhes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
