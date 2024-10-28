import { ChevronDownIcon, PlusIcon, ToolIcon } from "@/components/icons";
import { OpenAICredentialsModal } from "@/features/blocks/integrations/openai/components/OpenAICredentialsModal";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { ForgedBlockIcon } from "@/features/forge/ForgedBlockIcon";
import { ForgedBlockLabel } from "@/features/forge/ForgedBlockLabel";
import { CreateForgedCredentialsModal } from "@/features/forge/components/credentials/CreateForgedCredentialsModal";
import { useForgedBlock } from "@/features/forge/hooks/useForgedBlock";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Flex,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import type { WorkspaceAiFeature } from "@typebot.io/workspaces/schemas";
import { useState } from "react";
import { useWorkspace } from "../WorkspaceProvider";

type aiProvidersType = "openai" | "open-router" | "anthropic";

const aiProviders: aiProvidersType[] = ["openai", "open-router", "anthropic"];

export const InEditorAIFeatures = () => {
  const [selectedAiProvider, setSelectedAiProvider] = useState<
    aiProvidersType | undefined
  >(undefined);
  const [selectedAiCredential, setSelectedAiCredential] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { workspace, updateWorkspace } = useWorkspace();

  const {
    isOpen: isAIModalOpen,
    onOpen: onAIModalOpen,
    onClose: onAIModalClose,
  } = useDisclosure();

  const { data, isLoading, refetch } =
    trpc.credentials.listCredentials.useQuery(
      {
        workspaceId: workspace!.id,
        type: selectedAiProvider,
      },
      {
        enabled: !!workspace?.id && !!selectedAiProvider,
      },
    );

  const saveAiFeaturesCredential = (
    credentialId: string,
    credentialsType: aiProvidersType,
  ) => {
    if (!workspace?.id || !selectedAiProvider) return;

    updateWorkspace({
      aiFeatures: [
        {
          prompt: "Default prompt to generate group titles with AI",
          credentialId,
        },
      ],
    });
  };

  const addNewAccount = (provider: aiProvidersType) => {
    onAIModalOpen();
  };

  return (
    <>
      {workspace && !!workspace.inEditorAiFeaturesEnabled && (
        <HStack>
          <Flex>
            <FormLabel>AI Provider:</FormLabel>
            <Menu isLazy>
              <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                {selectedAiProvider ? (
                  <Flex gap={2}>
                    <ForgedBlockIcon type={selectedAiProvider} />
                    <ForgedBlockLabel type={selectedAiProvider} />
                  </Flex>
                ) : (
                  "Choose Provider"
                )}
              </MenuButton>
              <MenuList>
                {aiProviders.map((type) => (
                  <MenuItem
                    key={type}
                    icon={<BlockIcon type={type} boxSize="16px" />}
                    onClick={() => {
                      setSelectedAiProvider(type);
                      setSelectedAiCredential(null);
                      refetch();
                    }}
                  >
                    <BlockLabel type={type} />
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
          {!!selectedAiProvider &&
            !!data &&
            !!data.credentials &&
            !isLoading && (
              <Flex>
                <>
                  {data.credentials.length > 0 && (
                    <Menu isLazy>
                      <MenuButton
                        as={Button}
                        size="sm"
                        rightIcon={<ChevronDownIcon />}
                      >
                        {selectedAiCredential ? (
                          <Flex gap={2}>
                            <Text>{selectedAiCredential.name}</Text>
                          </Flex>
                        ) : (
                          `Select account`
                        )}
                      </MenuButton>
                      <MenuList>
                        {data?.credentials.map((cred) => (
                          <MenuItem
                            key={cred.id}
                            onClick={() => {
                              setSelectedAiCredential({
                                id: cred.id,
                                name: cred.name,
                              });
                              saveAiFeaturesCredential(
                                cred.id,
                                cred.type as aiProvidersType,
                              );
                            }}
                          >
                            <Text>{cred.name}</Text>
                          </MenuItem>
                        ))}
                        <MenuItem
                          icon={<PlusIcon />}
                          onClick={() => addNewAccount(selectedAiProvider)}
                        >
                          <Text>Connect new</Text>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                  {data.credentials.length === 0 && (
                    <Button
                      size={"sm"}
                      leftIcon={<PlusIcon />}
                      onClick={() => addNewAccount(selectedAiProvider)}
                    >
                      {`Add account`}
                    </Button>
                  )}
                </>
              </Flex>
            )}
        </HStack>
      )}
      <AICredentialsModal
        isOpen={isAIModalOpen}
        onClose={onAIModalClose}
        onNewCredentials={(credentialsId, provider) =>
          saveAiFeaturesCredential(credentialsId, provider)
        }
        aiProvider={selectedAiProvider!}
      />
    </>
  );
};

const AICredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
  aiProvider,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (credentialsId: string, provider: aiProvidersType) => void;
  aiProvider: aiProvidersType;
}) => {
  if (!aiProvider) return null;

  const { blockDef } = useForgedBlock(aiProvider);

  return (
    <>
      {aiProvider === "openai" && (
        <OpenAICredentialsModal
          isOpen={isOpen}
          onClose={onClose}
          onNewCredentials={(credentialsId) =>
            onNewCredentials(credentialsId, aiProvider)
          }
        />
      )}
      <CreateForgedCredentialsModal
        blockDef={blockDef!}
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={(credentialsId) =>
          onNewCredentials(credentialsId, aiProvider)
        }
      />
    </>
  );
};
