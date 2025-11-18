import { Wallet, LogOut, User, Hash, Mail, Link, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
} from '@chakra-ui/react'
import { MenuButton } from './MenuButton'
import {
  CombosModal,
  BoostsModal,
  AffiliateCodeModal,
  InviteModalEmail,
  InviteModalLink,
} from '@/components/Modals'
import { useMissions } from '@/hooks/useMissions'
import { WalletModal } from './WalletModal'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/utils/currency'
import { useMemo } from 'react'
import { LandingPageService } from '@/services/profile'
import { useQuery } from '@tanstack/react-query'

interface HeaderProps {
  onOpen: () => void
}

export function Header({ onOpen }: HeaderProps) {
  const { user, isLoggedIn, signout, isLoading } = useAuth()
  const router = useRouter()
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

  const {
    isOpen: isInviteOpen,
    onOpen: onInviteOpen,
    onClose: onInviteClose,
  } = useDisclosure()

  const {
    isOpen: isInviteEmailOpen,
    onOpen: onInviteEmailOpen,
    onClose: onInviteEmailClose,
  } = useDisclosure()

  const {
    isOpen: isInviteLinkOpen,
    onOpen: onInviteLinkOpen,
    onClose: onInviteLinkClose,
  } = useDisclosure()

  const {
    isOpen: isAffiliateCodeOpen,
    onOpen: onAffiliateCodeOpen,
    onClose: onAffiliateCodeClose,
  } = useDisclosure()

  const landingPageService = useMemo(() => new LandingPageService(), [])
  const { data: landingPageData } = useQuery({
    queryKey: ['landing-page-url'],
    queryFn: () => landingPageService.getLandingPageUrl(),
  })
  const landingPageUrl =
    landingPageData?.response?.data?.landing_page_url || '#'

  return (
    <Box w="screen" bg="#021165" px={3.5} pt={4} pb={10} alignContent="end">
      <Flex h={8} align="center" justify="space-between">
        <Flex gap={3} align="center" h={8}>
          <MenuButton onOpen={onOpen} />
          <Box display={{ base: 'none', md: 'block' }}>
            <Image
              src="/assets/affiliates.svg"
              alt="affiliates logo"
              width={155}
              height={28}
            />
          </Box>
        </Flex>
        <Flex h="full" gap={3} align="center">
          {(user?.role === 'affiliate' || user?.role === 'referral') && (
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
          )}
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
                  borderRadius={8}
                />
              ) : (
                <Avatar
                  src={user.avatar || undefined}
                  name={user.name || 'Usuário'}
                  width={8}
                  height={8}
                  borderRadius={8}
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
                {user?.role !== 'accountant' && (
                  <>
                    <MenuItem
                      icon={<User size={16} />}
                      fontSize="sm"
                      color="#131D53"
                      _hover={{ bg: '#F7FAFC' }}
                      onClick={() => {
                        const profilePath =
                          user?.role === 'brand' ||
                          user?.role === 'agent' ||
                          user?.role === 'seller'
                            ? '/brand/profile'
                            : '/affiliate/profile'
                        router.push(profilePath)
                      }}
                    >
                      Meu Perfil
                    </MenuItem>
                    <MenuDivider borderColor="#DEE6F2" />
                  </>
                )}

                {user?.role === 'affiliate' && user?.canHaveReferrals && (
                  <>
                    <MenuItem
                      icon={<UserPlus size={16} />}
                      fontSize="sm"
                      color="#131D53"
                      _hover={{ bg: '#F7FAFC' }}
                      onClick={onInviteOpen}
                    >
                      Convide um Novo afiliado
                    </MenuItem>
                    <MenuDivider borderColor="#DEE6F2" />
                  </>
                )}

                {user?.role === 'affiliate' &&
                  user?.canHaveReferrals &&
                  Boolean(user?.code) && (
                    <>
                      <MenuItem
                        icon={<Hash size={16} />}
                        fontSize="sm"
                        color="#131D53"
                        _hover={{ bg: '#F7FAFC' }}
                        onClick={onAffiliateCodeOpen}
                      >
                        Código de afiliado
                      </MenuItem>
                      <MenuDivider borderColor="#DEE6F2" />
                    </>
                  )}

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

      <Modal
        isOpen={isInviteOpen}
        onClose={onInviteClose}
        isCentered
        size={{ base: 'sm', md: 'md' }}
      >
        <ModalOverlay />
        <ModalContent
          rounded={16}
          p={{ base: 3, md: 4 }}
          mx={{ base: 4, md: 0 }}
          my={{ base: 4, md: 0 }}
        >
          <ModalCloseButton />
          <ModalHeader pb={2} px={{ base: 0, md: 0 }}>
            <VStack spacing={1} align="start">
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight={600}
                color="#131D53"
              >
                Convidar novo afiliado
              </Text>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={400}
                color="#131D5399"
              >
                Escolha como você gostaria de enviar o convite!
              </Text>
            </VStack>
          </ModalHeader>
          <ModalBody px={0} py={{ base: 3, md: 4 }}>
            <Flex gap={3} direction="row">
              <Button
                flex={1}
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={500}
                color="white"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                transition="all 0.2s ease"
                onClick={() => {
                  onInviteClose()
                  onInviteEmailOpen()
                }}
              >
                Por e-mail
              </Button>
              <Button
                flex={1}
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={500}
                variant="outline"
                color="#131D53"
                borderColor="#DEE6F2"
                bgColor="white"
                _hover={{
                  bgColor: '#F7FAFC',
                  borderColor: '#C5CDDC',
                }}
                onClick={() => {
                  onInviteClose()
                  onInviteLinkOpen()
                }}
              >
                Por link
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      <InviteModalEmail
        isOpen={isInviteEmailOpen}
        onClose={onInviteEmailClose}
        onBack={onInviteOpen}
      />
      <InviteModalLink
        isOpen={isInviteLinkOpen}
        onClose={onInviteLinkClose}
        onBack={onInviteOpen}
      />
      <AffiliateCodeModal
        isOpen={isAffiliateCodeOpen}
        onClose={onAffiliateCodeClose}
        landingPageUrl={landingPageUrl}
      />
    </Box>
  )
}
