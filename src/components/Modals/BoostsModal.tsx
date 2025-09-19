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
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@chakra-ui/react'
import { Boost } from '../../types/missions'
import { Zap } from 'lucide-react'

interface BoostsModalProps {
  isOpen: boolean
  onClose: () => void
  boosts: Boost[]
  activeBoosts: number
  totalBoosts: number
  onActivateBoost: (boostId: string) => void
  onDeactivateBoost: (boostId: string) => void
}

export const BoostsModal: React.FC<BoostsModalProps> = ({
  isOpen,
  onClose,
  boosts,
  activeBoosts,
  totalBoosts,
  onActivateBoost,
  onDeactivateBoost,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs" isCentered>
      <ModalOverlay />
      <ModalContent rounded={20}>
        <ModalHeader borderBottomWidth={1} borderBottomColor="#DEE6F2" p={3}>
          <HStack
            p={3}
            bgGradient="linear-gradient(110deg, #A463FC -4.7%, #914BF0 106.4%)"
            border="1px solid #DEE6F2"
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
              backgroundImage: `url(/assets/mission-boosts-bg-icon.svg)`,
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
              bg="#7331CE"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Zap size={20} color="white" />
            </Box>
            <HStack color="white" gap={3}>
              <HStack gap={1}>
                <Text fontSize="xs" fontWeight={400} lineHeight={4}>
                  Boosts:
                </Text>
                <Text fontSize="md" fontWeight={600}>
                  {totalBoosts}
                </Text>
              </HStack>

              <HStack gap={1}>
                <Text fontSize="xs" fontWeight={400} lineHeight={4}>
                  Boosts Ativos:
                </Text>
                <Text fontSize="md" fontWeight={600}>
                  {activeBoosts}
                </Text>
              </HStack>
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody p={3}>
          <VStack
            spacing={3}
            rounded={12}
            align="stretch"
            maxH="308px"
            p={3}
            overflow="auto"
            bg="#EEF2FD"
          >
            {boosts.map((boost) => (
              <Card
                key={boost.id}
                borderWidth={1}
                borderColor="#DEE6F2"
                borderRadius="12px"
                bg="white"
              >
                <CardHeader
                  borderBottomWidth={1}
                  borderBottomColor="#DEE6F2"
                  p={3}
                >
                  <HStack
                    justify="space-between"
                    align="center"
                    px={1}
                    gap={2.5}
                  >
                    <Text fontSize="sm" fontWeight={500} color="#131D53">
                      {boost.title}
                    </Text>
                    {boost.isActive && (
                      <Badge
                        colorScheme="green"
                        rounded={4}
                        px={2}
                        py={0.5}
                        fontSize="sm"
                        textTransform="initial"
                        fontWeight={400}
                        color="#054400"
                        bg="#E1FFDF"
                      >
                        Ativo
                      </Badge>
                    )}
                  </HStack>
                </CardHeader>

                <CardBody p={3}>
                  <VStack align="stretch" spacing={2}>
                    <Box bg="#DFEFFF" rounded={4} p={2}>
                      <HStack>
                        <Text fontSize="sm" color="#131D53">
                          {boost.commission}% de comissão nas{' '}
                          <Text as="strong">
                            próximas {boost.duration} vendas
                          </Text>
                        </Text>
                      </HStack>
                    </Box>

                    {boost.isActive &&
                      boost.progress !== undefined &&
                      boost.total !== undefined && (
                        <VStack align={'stretch'} gap={3}>
                          <Box position="relative">
                            <Box p={1} bg="#D7E4FF" rounded="full">
                              <Progress
                                value={(boost.progress / boost.total) * 100}
                                size="lg"
                                h="20px"
                                borderRadius="full"
                                bg="#B5C6EB"
                                sx={{
                                  '& > div': {
                                    background:
                                      'linear-gradient(270deg, #1F70F1 0%, #73ADEF 100%)',
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
                              {boost.progress}
                            </Text>
                          </Box>
                          <HStack justify="space-between" px={1}>
                            <Text fontSize="sm" color="#131D5399">
                              Vendas Feitas
                            </Text>
                            <Text
                              fontSize="sm"
                              fontWeight={500}
                              color="#131D53"
                            >
                              {boost.progress}/{boost.total} vendas
                            </Text>
                          </HStack>
                        </VStack>
                      )}
                  </VStack>
                </CardBody>
                <CardFooter p={3} borderTopWidth={1} borderTopColor="#DEE6F2">
                  <Button
                    size="md"
                    w="full"
                    rounded={8}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1.5}
                    fontSize="sm"
                    fontWeight={boost.isActive ? 400 : 600}
                    color={boost.isActive ? '#131D53' : '#9854F5'}
                    bgGradient={
                      boost.isActive
                        ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                        : 'linear-gradient(180deg, #F9F5FE 47.86%, #EAD5FF 123.81%)'
                    }
                    shadow={
                      boost.isActive
                        ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                        : '0px 0px 0px 1px #C099FF inset, 0px 0px 0px 2px #FFF inset'
                    }
                    className="border border-transparent disabled:border-[#9854F5] disabled:pointer-events-none"
                    onClick={() =>
                      boost.isActive
                        ? onDeactivateBoost(boost.id)
                        : onActivateBoost(boost.id)
                    }
                  >
                    {boost.isActive ? 'Desativar' : 'Ativar Boost'}
                    {!boost.isActive && <Zap size={24} color="#9854F5" />}
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
