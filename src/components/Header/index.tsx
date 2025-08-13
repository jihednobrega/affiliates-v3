import { Flame, Wallet, Zap, LogOut, User } from 'lucide-react'
import Image from 'next/image'
import {
  Box,
  Flex,
  Text,
  Button,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton as ChakraMenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Portal,
  Skeleton,
  Spinner,
} from '@chakra-ui/react'
import { MenuButton } from './MenuButton'
import { CombosModal } from '../modals/CombosModal'
import { BoostsModal } from '../modals/BoostsModal'
import { useMissions } from '@/hooks/useMissions'
import { WalletModal } from './WalletModal'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/utils/currency'

interface HeaderProps {
  onOpen: () => void
}

export function Header({ onOpen }: HeaderProps) {
  const { user, isLoggedIn, signout, isLoading } = useAuth()
  const {
    boosts,
    combo,
    getActiveBoosts,
    getTotalBoosts,
    activateBoost,
    deactivateBoost,
  } = useMissions()

  const {
    isOpen: isCombosOpen,
    onOpen: onCombosOpen,
    onClose: onCombosClose,
  } = useDisclosure()

  const {
    isOpen: isBoostsOpen,
    onOpen: onBoostsOpen,
    onClose: onBoostsClose,
  } = useDisclosure()

  const {
    isOpen: isWalletOpen,
    onOpen: onWalletOpen,
    onClose: onWalletClose,
  } = useDisclosure()

  return (
    <Box
      w="screen"
      h={100}
      bg="#021165"
      px={3.5}
      pt={5}
      pb={3}
      alignContent="end"
    >
      <Flex h={8} align="center" justify="space-between">
        <Flex gap={3} align="center" h={8}>
          <MenuButton onOpen={onOpen} />
          <Box display={{ base: 'none', md: 'block' }}>
            <Image
              src="/assets/affiliates.svg"
              alt="affiliates logo"
              width={155}
              height={30}
            />
          </Box>
        </Flex>
        <Flex h="full" gap={3} align="center">
          <Button
            display={{ base: 'flex', lg: 'none' }}
            size="sm"
            rounded={8}
            alignItems="center"
            justifyContent="center"
            py={1.5}
            px={3}
            gap={0.5}
            fontSize="sm"
            color="#FF4400"
            borderWidth={1}
            borderColor="#FF4400"
            bgGradient="linear-gradient(180deg, #FEFAF5 47.86%, #FFE5D5 123.81%)"
            shadow="0px 2px 4px 0px rgba(54, 34, 0, 0.70), 0px 0px 0px 1px #FFC799 inset, 0px 0px 0px 2px #FFF inset"
            onClick={onCombosOpen}
          >
            <Flame size={20} color="#FF4400" />
            <Text fontSize="xs" color="#FF4400" fontWeight={600}>
              14
            </Text>
          </Button>
          <Button
            display={{ base: 'flex', lg: 'none' }}
            size="sm"
            rounded={8}
            alignItems="center"
            justifyContent="center"
            py={1.5}
            px={3}
            gap={0.5}
            fontSize="sm"
            color="#9854F5"
            borderWidth={1}
            borderColor="#9854F5"
            bgGradient="linear-gradient(180deg, #F9F5FE 47.86%, #EAD5FF 123.81%)"
            shadow="0px 2px 4px 0px rgba(21, 0, 54, 0.70), 0px 0px 0px 1px #C099FF inset, 0px 0px 0px 2px #FFF inset"
            onClick={onBoostsOpen}
          >
            <Zap size={20} color="#9854F5" />
            <Text fontSize="xs" color="#9854F5" fontWeight={600}>
              2
            </Text>
          </Button>
          <Button
            py={1.5}
            px={3}
            size="sm"
            rounded={8}
            borderWidth={1}
            borderColor="#96C5FF"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            onClick={onWalletOpen}
          >
            <Wallet size={20} color="#131d53" />
            {isLoading ? (
              <Skeleton height="12px" width="50px" />
            ) : (
              <Text fontSize="xs" color="#131D53" fontWeight={600}>
                {formatCurrency(user.balance)}
              </Text>
            )}
          </Button>
          <Menu>
            <ChakraMenuButton
              as={Box}
              cursor="pointer"
              maxW={8}
              borderWidth={1}
              borderColor="#96C5FF"
              rounded={8}
              overflow="hidden"
            >
              {isLoading ? (
                <Box w={8} h={8} className="flex items-center justify-center">
                  <Spinner size="md" color="white" />
                </Box>
              ) : isLoggedIn && user.avatar ? (
                <Avatar
                  src={user.avatar}
                  name={user.name || 'Usuário'}
                  width={8}
                  height={8}
                  rounded={8}
                />
              ) : (
                <Avatar
                  src={user.avatar || undefined}
                  name={user.name || 'Usuário'}
                  width={8}
                  height={8}
                  rounded={8}
                />
              )}
            </ChakraMenuButton>
            <Portal>
              <MenuList
                bg="white"
                borderColor="#DEE6F2"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.15)"
                py={2}
                minW="200px"
                zIndex={9999}
              >
                <MenuItem
                  icon={<User size={16} />}
                  fontSize="sm"
                  color="#131D53"
                  _hover={{ bg: '#F7FAFC' }}
                  isDisabled
                >
                  {user.name || 'Usuário'}
                </MenuItem>
                <MenuDivider borderColor="#DEE6F2" />
                <MenuItem
                  icon={<LogOut size={16} />}
                  fontSize="sm"
                  color="#E53E3E"
                  _hover={{ bg: '#FED7D7', color: '#C53030' }}
                  onClick={signout}
                >
                  Sair
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Flex>
      <CombosModal
        isOpen={isCombosOpen}
        onClose={onCombosClose}
        combo={combo}
      />

      <BoostsModal
        isOpen={isBoostsOpen}
        onClose={onBoostsClose}
        boosts={boosts}
        activeBoosts={getActiveBoosts()}
        totalBoosts={getTotalBoosts()}
        onActivateBoost={activateBoost}
        onDeactivateBoost={deactivateBoost}
      />

      <WalletModal isOpen={isWalletOpen} onClose={onWalletClose} />
    </Box>
  )
}
