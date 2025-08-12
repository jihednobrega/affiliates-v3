import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  Box,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react'
import { Level } from '../../types/missions'
import { Medal } from 'lucide-react'

interface LevelModalProps {
  isOpen: boolean
  onClose: () => void
  level: Level | null
}

export const LevelModal: React.FC<LevelModalProps> = ({
  isOpen,
  onClose,
  level,
}) => {
  if (!level) return null

  const progressPercentage = (level.sales / level.nextSales) * 100
  const remainingSales = level.nextSales - level.sales

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs" isCentered>
      <ModalOverlay />
      <ModalContent rounded={20}>
        <ModalHeader borderBottomWidth={1} borderBottomColor="#DEE6F2" p={3}>
          <HStack
            p={3}
            bgGradient="linear-gradient(110deg, #195DBC -4.7%, #3E89F2 106.4%)"
            border="1px solid #C7DEFF"
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
              backgroundImage: `url(/assets/mission-level-bg-icon.svg)`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top right',
              backgroundSize: 'cover',
              opacity: 1,
              pointerEvents: 'none',
            }}
          >
            <Box
              w="36px"
              h="36px"
              bg="#05439B"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Medal size={20} color="white" />
            </Box>
            <VStack align="start" gap={1} color="white">
              <Text fontSize="xs" fontWeight={400} lineHeight={4}>
                Level Atual:
              </Text>
              <Text fontSize="md" fontWeight={600} lineHeight={4}>
                {level.title}
              </Text>
            </VStack>
          </HStack>

          <HStack px={1} justify="space-between" my={3} lineHeight={4}>
            <Text fontSize="sm" color="#131D5399" fontWeight={400}>
              Nível Atual:
            </Text>
            <Text fontSize="sm" fontWeight={600} color="#131D53">
              {level.sales} vendas
            </Text>
          </HStack>
          <HStack
            bg="#D7E4FF"
            rounded={4}
            gap={1}
            px={1.5}
            py={2}
            align="center"
            w="fit-content"
            lineHeight={4}
          >
            <Text fontSize="sm" fontWeight={400} color="#131D5399">
              Comissão atual
            </Text>
            <Text fontSize="sm" fontWeight={500} color="#131D53">
              +{level.currentCommission}%
            </Text>
          </HStack>
        </ModalHeader>

        <ModalBody p={3}>
          <HStack px={1} justify="space-between" lineHeight={4}>
            <Text fontSize="sm" color="#131D5399">
              Próximo Nível:
            </Text>
            <Text fontSize="sm" fontWeight={600} color="#131D53">
              {level.nextSales} vendas
            </Text>
          </HStack>
          <HStack
            bg="#D7E4FF"
            rounded={4}
            gap={1}
            px={1.5}
            py={2}
            align="center"
            w="fit-content"
            lineHeight={4}
            mt={3}
          >
            <Text fontSize="sm" color="#131D5399">
              Comissão
            </Text>
            <Text fontSize="sm" fontWeight={500} color="#131D53">
              +{level.nextCommission}%
            </Text>
          </HStack>
        </ModalBody>

        <ModalFooter p={3} borderTopWidth={1} borderTopColor="#DEE6F2">
          <Button
            w="full"
            size="md"
            fontSize="sm"
            borderRadius="md"
            color="#131D53"
            fontWeight={400}
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
          >
            Ver Perfil
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
