import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Brackets, 
  FileCode, 
  FolderCheck, 
  History, 
  Settings2, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Play, 
  RefreshCw, 
  Send, 
  Check, 
  FileJson, 
  Info,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Database,
  CheckCircle,
  Terminal
} from 'lucide-react';
import { DocCard } from '../types';
import {
  normalizePortalBossPayload,
  getMockPayloadForDoc,
  getPlaceholdersForDoc,
  PF_FIELD_RULES,
  PJ_FIELD_RULES,
  SOCIO_FIELD_RULES,
  BANKING_FIELD_RULES,
  ACESSO_FIELD_RULES,
  PF_MANDATORY_FIELDS,
  PJ_MANDATORY_FIELDS,
  PortalBossPayload,
  NormalizedGdiData,
  GdiLogEntry,
  getFormattedNow
} from '../utils/portalBossMapper';

interface AutomacaoConfigViewProps {
  card: DocCard;
  onBackToAutomacao: () => void;
  onBackToCentral: () => void;
}

export default function AutomacaoConfigView({ card, onBackToAutomacao, onBackToCentral }: AutomacaoConfigViewProps) {
  // States of configuration
  const [templateId, setTemplateId] = useState<string>('1fT22Z7M9K6hX8yPsN3w_MOCK_GDOCS_ID_' + card.id.toUpperCase());
  const [templateStatus, setTemplateStatus] = useState<'não_configurado' | 'configurado' | 'validado' | 'erro_template'>('validated');
  const [templateError, setTemplateError] = useState<string>('');
  
  // Custom GDI sandboxed raw Payload state
  const [rawPayloadText, setRawPayloadText] = useState<string>(() => {
    const defaultM = getMockPayloadForDoc(card.documentType, (card.category || 'PF').toUpperCase() as 'PF' | 'PJ');
    return JSON.stringify(defaultM, null, 2);
  });

  // Dynamic calculated parameters based on Portal BOSS Mapper
  let parsedPayload: PortalBossPayload = {};
  let parseError: string | null = null;
  try {
    parsedPayload = JSON.parse(rawPayloadText);
  } catch (err: any) {
    parseError = err.message;
  }

  const mapperResult = normalizePortalBossPayload(parsedPayload);
  const normalizedData = mapperResult.normalized;
  const isPayloadValid = !parseError && mapperResult.validation.isValid;

  // Custom states for testing/simulation
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'success' | 'failed'>('success');
  const [simulationErrorType, setSimulationErrorType] = useState<string>('PAYLOAD_EMPTY');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  
  // Anti-duplicidade states
  const [existingDocConflict, setExistingDocConflict] = useState<boolean>(false);
  const [antiDuplicitySetting, setAntiDuplicitySetting] = useState<'new_version' | 'alert' | 'cancel'>('alert');
  
  // Reprocessamento states
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastRetryAt, setLastRetryAt] = useState<string>('Nunca');
  const [reprocessReason, setReprocessReason] = useState<string>('Reenvio manual após validação de parâmetros');

  // Diagnostic steps tracking
  const [diagnosticSteps, setDiagnosticSteps] = useState({
    received: true,
    docTypeValid: true,
    templateConfigured: true,
    placeholdersMapped: true,
    destinationIdReceived: true,
    gdiHasPermission: true,
    docCreated: true,
    savedToFolder: true,
    resultPrepared: true,
    returnedToBoss: true,
  });

  // Dynamic success/failure logs populated by mapper results
  const [performanceLogs, setPerformanceLogs] = useState<Array<GdiLogEntry>>([]);

  // Synchronize dynamic payload changes and validate in real time
  useEffect(() => {
    let currentPayload = {};
    try {
      currentPayload = JSON.parse(rawPayloadText);
    } catch {
      // Keep state alive even on intermediate syntax errors (e.g. typing JSON)
      const emptyLogs: GdiLogEntry[] = [{
        timestamp: getFormattedNow(),
        step: 'GDI_PAYLOAD_PARSING_FAILED',
        status: 'failed',
        message: 'Falha crítica: O corpo da mensagem enviada no barramento não é um JSON válido.',
        details: 'Revise colchetes, vírgulas e aspas duplas no editor.'
      }];
      setPerformanceLogs(emptyLogs);
      setSimulationStatus('failed');
      setDiagnosticSteps({
        received: false,
        docTypeValid: false,
        templateConfigured: false,
        placeholdersMapped: false,
        destinationIdReceived: false,
        gdiHasPermission: false,
        docCreated: false,
        savedToFolder: false,
        resultPrepared: false,
        returnedToBoss: false,
      });
      return;
    }

    const valResult = normalizePortalBossPayload(currentPayload);
    const isOk = valResult.validation.isValid;
    setSimulationStatus(isOk ? 'success' : 'failed');
    
    // Auto populate diagnostics checklist relative to actual presence list
    const hasDocType = !!valResult.normalized.documentType;
    const hasFolder = !!valResult.normalized.destinationFolderId;
    
    setDiagnosticSteps({
      received: true,
      docTypeValid: hasDocType,
      templateConfigured: templateStatus === 'validated' || templateStatus === 'configurado',
      placeholdersMapped: isOk,
      destinationIdReceived: hasFolder,
      gdiHasPermission: hasFolder && templateStatus !== 'erro_template',
      docCreated: isOk,
      savedToFolder: isOk,
      resultPrepared: isOk,
      returnedToBoss: isOk,
    });

    setPerformanceLogs(valResult.logs);
  }, [rawPayloadText, templateStatus]);

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(label);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  // Helper friendly names mapping for standard document title outputs
  const getDocFriendlyName = () => {
    switch (card.id) {
      case 'procuracao-pf': return 'Procuração Pessoa Física';
      case 'procuracao-pj': return 'Procuração Pessoa Jurídica';
      case 'declaracao-pobreza-pf': return 'Declaração de Pobreza Pessoa Física';
      case 'declaracao-pobreza-pj': return 'Declaração de Pobreza Pessoa Jurídica';
      case 'contrato-honorarios-pf': return 'Contrato de Honorários Pessoa Física';
      case 'contrato-honorarios-pj': return 'Contrato de Honorários Pessoa Jurídica';
      case 'primeiro-atendimento-pf': return '1º Atendimento Pessoa Física';
      case 'primeiro-atendimento-pj': return '1º Atendimento Pessoa Jurídica';
      default: return card.title;
    }
  };

  // 4. Placeholders mappings according to current selected card.id
  const getMappedPlaceholders = () => {
    const currentPlaceholders = getPlaceholdersForDoc(card.documentType, normalizedData);
    return Object.entries(currentPlaceholders).map(([key, val]) => {
      let pathStr = 'payload.clientRawData';
      let isMandatory = 'Não';
      
      const isPF = card.category.toUpperCase() === 'PF';
      if (isPF) {
        // Find matching field rule
        const rule = PF_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{outorgante_', 'pf_').replace('}}', ''));
        if (rule) {
          pathStr = `payload.clientRawData.pfData.${rule.key}`;
          if (PF_MANDATORY_FIELDS.includes(rule.key)) {
            isMandatory = 'Sim';
          }
        } else {
          // Check falling fallback declarante
          const declRule = PF_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{declarante_', 'pf_').replace('}}', ''));
          if (declRule) {
            pathStr = `payload.clientRawData.pfData.${declRule.key}`;
            if (PF_MANDATORY_FIELDS.includes(declRule.key)) {
              isMandatory = 'Sim';
            }
          }
        }
      } else {
        // PJ rules
        const pjRule = PJ_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{empresa_', 'pj_').replace('}}', ''));
        const socioRule = SOCIO_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{representante_', 'socio_').replace('}}', ''));
        if (pjRule) {
          pathStr = `payload.clientRawData.pjDadosEmpresa.${pjRule.key}`;
          if (PJ_MANDATORY_FIELDS.includes(pjRule.key)) {
            isMandatory = 'Sim';
          }
        } else if (socioRule) {
          pathStr = `payload.clientRawData.socioDadosPessoais.${socioRule.key}`;
          if (PJ_MANDATORY_FIELDS.includes(socioRule.key)) {
            isMandatory = 'Sim';
          }
        }
      }

      // Office checks
      if (key === '{{LOCAL_ASSINATURA}}' || key === '{{DATA_ASSINATURA}}' || key === '{{ADVOGADO_NOME}}' || key === '{{ADVOGADO_OAB}}') {
        pathStr = `payload.officeData.${key.toLowerCase().replace('{{', '').replace('}}', '').replace('advogado_', 'advogado')}`;
        isMandatory = 'Sim';
      }

      // Case checks
      if (key === '{{NATUREZA_ACAO}}' || key === '{{VALOR_HONORARIOS}}' || key === '{{FORMA_PAGAMENTO}}' || key === '{{VARA_COMPETENTE}}' || key === '{{FORO_COMARCA}}' || key === '{{RELATO_FATOS}}' || key === '{{VALOR_CAUSA_ESTIMADO}}') {
        pathStr = `payload.caseData.${key.toLowerCase().replace('{{', '').replace('}}', '').replace('_estimado', '')}`;
        if (key !== '{{VALOR_CAUSA_ESTIMADO}}') {
          isMandatory = 'Sim';
        }
      }

      return {
        placeholder: key,
        payloadField: pathStr,
        mandatory: isMandatory,
        example: val || '(vazio)',
        status: val ? 'Localizado' : 'Não Informado'
      };
    });
  };

  // Helper static structured mock schema JSON contract representing inputs from Portal BOSS
  const getPayloadContractJson = () => {
    return JSON.stringify({
      documentType: card.documentType,
      caseId: 'CASE-2026-98745',
      clientId: 'CLI-87612',
      source: 'Portal BOSS Clientes',
      target: 'GDI',
      destinationFolderId: '1H9D48xPlOsM2z7_GD_FOLDER_ID_MOCK',
      destinationFolderUrl: 'https://drive.google.com/drive/folders/1H9D48xPlOsM2z7_GD_FOLDER_ID_MOCK',
      clientData: card.category === 'pj' ? {
        razaoSocial: 'Exemplo Serviços Empresariais S/A',
        cnpj: '12.345.678/0001-90',
        representanteNome: 'Rui Barbosa Neto',
        representanteCpf: '123.456.789-01',
        representanteCargo: 'Diretor Geral',
        nomeFantasia: 'Exemplo S/A' 
      } : {
        nomeCompleto: 'Guilherme Giffoni Fagundes',
        cpf: '098.765.432-10',
        rg: 'RG-15.422.388-SSPSP',
        estadoCivil: 'Solteiro',
        nacionalidade: 'Brasileiro',
        profissao: 'Engenheiro Agrônomo',
        endereco: 'Rua das Flores, 452, Porto Alegre - RS, CEP 90020-080',
        telefone: '(51) 99122-3344'
      },
      caseData: {
        naturezaAcao: 'Ambiental e Possessória',
        valorHonorarios: 'R$ 8.000,00',
        formaPagamento: 'Entrada de R$ 2.000,00 via PIX + 12 parcelas mensais',
        varaCompetente: '3ª Vara Cível da Comarca de Canoas/RS',
        foroComarca: 'Foro Central de Canoas',
        relatoFatos: 'Cobrança indevida de taxas municipais ambientais sobre propriedade produtiva familiar.'
      },
      officeData: {
        advogadoNome: 'Dr. Roberto Giffoni',
        advogadoOab: 'OAB/RS 74.225',
        escritorioNome: 'Giffoni & Associados Advocacia'
      },
      requestedBy: 'workflow_auto_boss_giffoni_user',
      createdAt: '2026-06-02T17:52:12Z'
    }, null, 2);
  };

  // Helper static structured mock schema JSON contract representing GDI return
  const getCallbackSuccessJson = () => {
    return JSON.stringify({
      status: 'success',
      documentType: card.documentType,
      caseId: 'CASE-2026-98745',
      clientId: 'CLI-87612',
      googleDocsId: '1fT22Z7M9K6hX8yPsN3w_MOCK_DOC_OUT_001',
      googleDocsUrl: 'https://docs.google.com/document/d/1fT22Z7M9K6hX8yPsN3w_MOCK_DOC_OUT_001/edit?usp=drivesdk',
      fileName: `DRAFT_EXEC_${card.documentType.toUpperCase()}_CASE_2026_98745.pdf`,
      destinationFolderId: '1H9D48xPlOsM2z7_GD_FOLDER_ID_MOCK',
      generatedAt: '2026-06-02T17:52:19Z',
      logs: performanceLogs.map(l => ({
        timestamp: l.timestamp,
        step: l.step,
        status: l.status,
        message: l.message
      }))
    }, null, 2);
  };

  // Helper failure contracts structure
  const getCallbackFailureJson = (errorCode: string, errorMsg: string) => {
    return JSON.stringify({
      status: 'failed',
      documentType: card.documentType,
      caseId: 'CASE-2026-98745',
      clientId: 'CLI-87612',
      errorCode: errorCode,
      errorMessage: errorMsg,
      failedAt: '2026-06-02T17:52:14Z',
      logs: [
        { timestamp: '02/06/2026 17:52:12', step: 'GDI_JOB_RECEIVED', status: 'success', message: 'Job recebido no endpoint de recepção estática' },
        { timestamp: '02/06/2026 17:52:13', step: 'GDI_PAYLOAD_VALIDATED', status: 'failed', message: 'Falha durante o processamento', details: errorMsg }
      ]
    }, null, 2);
  };

  // Failure scenario details depending on chosen simulated error type
  const getErrorTypeDetail = (type: string) => {
    switch (type) {
      case 'PAYLOAD_EMPTY':
        return {
          code: 'PAYLOAD_EMPTY',
          step: 'GDI_PAYLOAD_VALIDATED',
          message: 'Falha crítica: O payload de dados recebido está vazio ou corrompido.',
          reason: 'A requisição postada pelo integrador não continha strings JSON válidas no body.',
          stack: 'Error: Cannot parsed void request body mapping properties at WebServer.processIncoming (server.ts:142:15)'
        };
      case 'DOCUMENT_TYPE_MISSING':
        return {
          code: 'DOCUMENT_TYPE_MISSING',
          step: 'GDI_PAYLOAD_VALIDATED',
          message: 'Falha crítica: O campo "documentType" não foi fornecido na mensagem.',
          reason: 'O cabeçalho ou payload do webhook não especificou qual classificador documental deve ser acionado.',
          stack: 'Error: Field "documentType" is mandatory at validation.ts:42:29'
        };
      case 'DOCUMENT_TYPE_INVALID':
        return {
          code: 'DOCUMENT_TYPE_INVALID',
          step: 'GDI_PAYLOAD_VALIDATED',
          message: `Falha crítica: O classificador documentType recebido no payload é incompatível com esta rota de automação.`,
          reason: 'O integrador enviou um documentType incompatível do esperado.',
          stack: 'Error: Type schema mismatch at validator.ts:98:12'
        };
      case 'CASE_ID_MISSING':
        return {
          code: 'CASE_ID_MISSING',
          step: 'GDI_PAYLOAD_VALIDATED',
          message: 'Falha porque o identificador de caso "caseId" do Portal BOSS não foi recebido.',
          reason: 'O fluxo necessita do ID do caso associado para anexação e feedback no Portal BOSS Clientes.',
          stack: 'Error: Field payload.caseId is required for operational binding'
        };
      case 'CLIENT_ID_MISSING':
        return {
          code: 'CLIENT_ID_MISSING',
          step: 'GDI_PAYLOAD_VALIDATED',
          message: 'Falha porque o identificador de cliente "clientId" está ausente.',
          reason: 'O ID do cliente não foi localizado no payload recebido do Portal BOSS.',
          stack: 'Error: Field payload.clientId cannot be null'
        };
      case 'CLIENT_DATA_MISSING':
        return {
          code: 'CLIENT_DATA_MISSING',
          step: 'GDI_PLACEHOLDERS_VALIDATED',
          message: 'Falha porque o "clientData" contendo as chaves variáveis do cliente está ausente.',
          reason: 'Faltam dados essenciais do cliente para subscrever os campos obrigatórios do documento.',
          stack: 'Error: Field payload.clientData is undefined or lacks minimum keys'
        };
      case 'DESTINATION_FOLDER_ID_MISSING':
        return {
          code: 'DESTINATION_FOLDER_ID_MISSING',
          step: 'GDI_DESTINATION_FOLDER_VALIDATED',
          message: 'Falha porque destinationFolderId não foi recebido.',
          reason: 'O ID da pasta destino do Google Drive é obrigatório para arquivamento estruturado.',
          stack: 'Error: destinationFolderId cannot be empty. GDI requires solid reference to target disk.'
        };
      case 'DESTINATION_FOLDER_URL_MISSING':
        return {
          code: 'DESTINATION_FOLDER_URL_MISSING',
          step: 'GDI_DESTINATION_FOLDER_VALIDATED',
          message: 'Falha porque destinationFolderUrl não foi recebido.',
          reason: 'O link amigável de destino no Google Drive é obrigatório para devolução de resposta formatada.',
          stack: 'Error: destinationFolderUrl cannot be empty. GDI requires link reference.'
        };
      case 'DESTINATION_FOLDER_PERMISSION_DENIED':
        return {
          code: 'DESTINATION_FOLDER_PERMISSION_DENIED',
          step: 'GDI_DESTINATION_FOLDER_VALIDATED',
          message: 'Falha porque o GDI não possui permissão para salvar na pasta informada.',
          reason: 'Erro de permissão no Google Drive OAuth. A conta de serviço do GDI necessita de acesso leitura/escrita na pasta fornecida.',
          stack: 'Error: 403 Permission Denied. Service account does not have edit access to Google Drive Folder: ' + card.id
        };
      case 'DESTINATION_FOLDER_NOT_FOUND':
        return {
          code: 'DESTINATION_FOLDER_NOT_FOUND',
          step: 'GDI_DESTINATION_FOLDER_VALIDATED',
          message: 'Falha porque as referências de pasta destino não foram localizadas ou foram apagadas no Google Drive.',
          reason: 'O Google Drive retornou código 404 para a pasta especificada.',
          stack: 'Error: 404 Folder Not Found on Google Drive API call'
        };
      case 'TEMPLATE_ID_MISSING':
        return {
          code: 'TEMPLATE_ID_MISSING',
          step: 'GDI_TEMPLATE_FOUND',
          message: `Falha porque o template da ${getDocFriendlyName()} não foi configurado.`,
          reason: 'O ID do template do Google Docs correspondente no GDI está vazio nas configurações da automação.',
          stack: 'Error: GDocs template id is null under current route mapping'
        };
      case 'TEMPLATE_NOT_FOUND':
        return {
          code: 'TEMPLATE_NOT_FOUND',
          step: 'GDI_TEMPLATE_FOUND',
          message: 'Falha porque o template com o ID especificado não foi localizado no Google Docs.',
          reason: 'O arquivo original do template pode ter sido excluído ou movido da conta corporativa proprietária.',
          stack: 'Error: 404 Google Docs File Not Found for ID: ' + templateId
        };
      case 'TEMPLATE_PERMISSION_DENIED':
        return {
          code: 'TEMPLATE_PERMISSION_DENIED',
          step: 'GDI_TEMPLATE_FOUND',
          message: 'Falha porque o GDI não possui permissão para ler o Template do Google Docs especificado.',
          reason: 'Autorização recusada. Atribua acesso de leitura pública ou compartilhe o template com a conta de serviço do GDI.',
          stack: 'Error: 403 Google API Access Denied'
        };
      case 'TEMPLATE_PLACEHOLDERS_INVALID':
        return {
          code: 'TEMPLATE_PLACEHOLDERS_INVALID',
          step: 'GDI_PLACEHOLDERS_VALIDATED',
          message: 'Falha porque o placeholder {{OUTORGANTE_CPF}} não possui campo correspondente no payload.',
          reason: 'Há incompatibilidade estrutural. O template Google Docs espera a variável de CPF, mas a mesma não consta no payload.',
          stack: 'Error: Placeholder mismatch validator exception at substitution_engine.ts:312:14'
        };
      default:
        return {
          code: 'GENERIC_ERROR',
          step: 'GDI_PAYLOAD_VALIDATED',
          message: 'Erro desconhecido durante processamento.',
          reason: 'Motivo inexplicado ou falha de infraestrutura interna do sandbox.',
          stack: 'Unknown internal error'
        };
    }
  };

  const handleSimulateSuccess = () => {
    setSimulationStatus('success');
    setTemplateStatus('validated');
    setTemplateError('');
    setExistingDocConflict(false);
    
    // Reset raw text payload to a perfectly valid complete mock!
    const okMock = getMockPayloadForDoc(card.documentType, (card.category || 'PF').toUpperCase() as 'PF' | 'PJ');
    setRawPayloadText(JSON.stringify(okMock, null, 2));
  };

  const handleSimulateFailure = (errorTypeString?: string) => {
    const errorType = errorTypeString || simulationErrorType;
    setSimulationStatus('failed');
    
    const errObj = getErrorTypeDetail(errorType);

    if (errorType.startsWith('TEMPLATE_')) {
      setTemplateStatus('erro_template');
      setTemplateError(errObj.message);
    } else {
      setTemplateStatus('validated');
      setTemplateError('');
    }

    // Adapt raw text payload in the editable area to simulate the error!
    try {
      const currentObj = JSON.parse(rawPayloadText);
      if (errorType === 'PAYLOAD_EMPTY') {
        setRawPayloadText('');
      } else if (errorType === 'DOCUMENT_TYPE_MISSING') {
        delete currentObj.documentType;
        setRawPayloadText(JSON.stringify(currentObj, null, 2));
      } else if (errorType === 'DOCUMENT_TYPE_INVALID') {
        currentObj.documentType = 'TIPO_INVALIDO_OUTRO_DOC';
        setRawPayloadText(JSON.stringify(currentObj, null, 2));
      } else if (errorType === 'CLIENT_DATA_MISSING') {
        delete currentObj.clientRawData;
        setRawPayloadText(JSON.stringify(currentObj, null, 2));
      } else if (errorType === 'DESTINATION_FOLDER_ID_MISSING') {
        delete currentObj.destinationFolderId;
        setRawPayloadText(JSON.stringify(currentObj, null, 2));
      } else if (errorType === 'DESTINATION_FOLDER_URL_MISSING') {
        delete currentObj.destinationFolderUrl;
        setRawPayloadText(JSON.stringify(currentObj, null, 2));
      }
    } catch {
      // Keep silent on syntax bugs
    }

    // Adjust diagnostic checklist steps based on error
    const newDiagnostic = {
      received: true,
      docTypeValid: true,
      templateConfigured: true,
      placeholdersMapped: true,
      destinationIdReceived: true,
      gdiHasPermission: true,
      docCreated: true,
      savedToFolder: true,
      resultPrepared: true,
      returnedToBoss: true,
    };

    if (errorType === 'PAYLOAD_EMPTY') {
      newDiagnostic.received = false;
      newDiagnostic.docTypeValid = false;
    }
    if (errorType === 'DOCUMENT_TYPE_MISSING' || errorType === 'DOCUMENT_TYPE_INVALID') {
      newDiagnostic.docTypeValid = false;
    }
    if (errorType === 'TEMPLATE_ID_MISSING' || errorType === 'TEMPLATE_NOT_FOUND' || errorType === 'TEMPLATE_PERMISSION_DENIED') {
      newDiagnostic.templateConfigured = false;
    }
    if (errorType === 'TEMPLATE_PLACEHOLDERS_INVALID' || errorType === 'CLIENT_DATA_MISSING') {
      newDiagnostic.placeholdersMapped = false;
    }
    if (errorType === 'DESTINATION_FOLDER_ID_MISSING' || errorType === 'DESTINATION_FOLDER_URL_MISSING') {
      newDiagnostic.destinationIdReceived = false;
    }
    if (errorType === 'DESTINATION_FOLDER_PERMISSION_DENIED' || errorType === 'DESTINATION_FOLDER_NOT_FOUND') {
      newDiagnostic.gdiHasPermission = false;
    }

    // Set trailing process as false for failures
    const stepsArray: Array<keyof typeof newDiagnostic> = [
      'received', 'docTypeValid', 'templateConfigured', 'placeholdersMapped',
      'destinationIdReceived', 'gdiHasPermission', 'docCreated', 'savedToFolder',
      'resultPrepared', 'returnedToBoss'
    ];

    let foundFail = false;
    for (const step of stepsArray) {
      if (!newDiagnostic[step]) {
        foundFail = true;
      }
      if (foundFail) {
        newDiagnostic[step] = false;
      }
    }

    setDiagnosticSteps(newDiagnostic);

    // Build matching logs
    const errorLogs = [];
    let logTimeSec = 12;

    for (const step of stepsArray) {
      const isSuccess = newDiagnostic[step];
      const logStepName = getLogStepName(step);
      
      if (isSuccess) {
        errorLogs.push({
          timestamp: `02/06/2026 17:52:${logTimeSec++}`,
          step: logStepName,
          status: 'success' as const,
          message: getStepSuccessMsg(step),
          details: 'Componente validado com sucesso'
        });
      } else {
        errorLogs.push({
          timestamp: `02/06/2026 17:52:${logTimeSec++}`,
          step: logStepName,
          status: 'failed' as const,
          message: errObj.message,
          details: errObj.reason
        });
        break; // Stop listing logs on fail step
      }
    }

    setPerformanceLogs(errorLogs);
  };

  const getLogStepName = (stepKey: string): string => {
    switch (stepKey) {
      case 'received': return 'GDI_JOB_RECEIVED';
      case 'docTypeValid': return 'GDI_PAYLOAD_VALIDATED';
      case 'templateConfigured': return 'GDI_TEMPLATE_FOUND';
      case 'placeholdersMapped': return 'GDI_PLACEHOLDERS_VALIDATED';
      case 'destinationIdReceived': return 'GDI_DESTINATION_FOLDER_VALIDATED';
      case 'gdiHasPermission': return 'GDI_DESTINATION_FOLDER_VALIDATED';
      case 'docCreated': return 'GDI_DOCUMENT_CREATED';
      case 'savedToFolder': return 'GDI_DOCUMENT_SAVED_TO_FOLDER';
      case 'resultPrepared': return 'GDI_RESULT_READY';
      case 'returnedToBoss': return 'GDI_RESULT_RETURNED_TO_PORTAL';
      default: return 'GDI_PROCESSING';
    }
  };

  const getStepSuccessMsg = (stepKey: string): string => {
    switch (stepKey) {
      case 'received': return 'Job recebido no endpoint de recepção estática';
      case 'docTypeValid': return 'Payload do BOSS Clientes validado com sucesso';
      case 'templateConfigured': return 'Template ID encontrado no Google Docs drive';
      case 'placeholdersMapped': return 'Todos os placeholders do template mapeados';
      case 'destinationIdReceived': return 'ID da pasta destino localizado no payload';
      case 'gdiHasPermission': return 'Pasta de destino do Drive está acessível e possui permissões';
      default: return 'Etapa concluída com sucesso';
    }
  };

  const handleReprocess = () => {
    setRetryCount(prev => prev + 1);
    const dateStr = new Date().toLocaleString('pt-BR');
    setLastRetryAt(dateStr);
    
    // Simulate reprocess check
    if (simulationStatus === 'failed') {
      // Small feedback
      alert(`Reprocessamento disparado (Tentativa #${retryCount + 1}).\nStatus anterior: FALHA.\nReprocessando com parâmetros simulados...`);
      // Randomly auto correct or keep failing
      handleSimulateSuccess();
    } else {
      alert(`Reprocessamento disparado para Job ativo com sucesso. Nenhuma ação estrita necessária, logs redefinidos.`);
      handleSimulateSuccess();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-16">
      
      {/* 4. UPPER LAYOUT HEADER & STICKY ACTION PANEL */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Configuração da automação {getDocFriendlyName()}
            </h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-100 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full">
              documentType: {card.documentType}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Painel de preparação operacional para integração direta entre o Portal BOSS Clientes e o GDI (Google Docs Integrations).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={onBackToAutomacao}
            className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para Automação</span>
          </button>
          
          <button 
            onClick={onBackToCentral}
            className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-650 hover:text-blue-600 transition bg-slate-100 hover:bg-slate-200 border border-slate-200/65 px-3 py-2 rounded-lg cursor-pointer"
          >
            <span>Central GDI</span>
          </button>

          <button 
            onClick={() => handleSimulateSuccess()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95 inline-flex items-center space-x-1 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Testar Configuração</span>
          </button>

          <button 
            onClick={() => triggerCopy(getPayloadContractJson(), 'payload')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-[11px] px-3 py-2 rounded-lg transition active:scale-95 inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <FileJson className="h-3.5 w-3.5" />
            <span>Copiar Contrato</span>
          </button>
        </div>
      </div>

      {copiedMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg z-50 animate-bounce">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Contrato de dados copiado para a área de transferência!</span>
        </div>
      )}

      {/* Subtitle Alert Row */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">STATUS DA INTEGRADO</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Preparado para integração real (GDI Cloud Active)</span>
            </div>
          </div>
          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">ID DO REGISTRO TÉCNICO</span>
            <span className="text-xs font-mono font-bold text-slate-200">ENV_SANDBOX_STABLE_2026</span>
          </div>
        </div>
        <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-right flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-mono text-slate-300">Aguardando payload disparado via Portal BOSS</span>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: AUTOMATION SERVICES, TEMPLATES, DRIVE MAPPING, PAYLOAD & CALLBACK SCHEMA */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. CARD — JOBS RECEBIDOS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Terminal className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Jobs Recebidos</h3>
                  <p className="text-[10px] text-slate-400">Verificação do fluxo de fila síncrona enviada do Portal BOSS</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                  simulationStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  Status do Job: {simulationStatus === 'success' ? 'CONCLUÍDO' : 'FALHA / ERRO'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Síncrono
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 divide-y divide-slate-150 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Último Job Recebido</span>
                    <span className="text-xs text-slate-800 font-bold font-mono">#GDI-JOB-{(card.id || 'pf').toUpperCase()}-2026-003</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Horário de recebimento</span>
                    <span className="text-xs text-slate-800 font-medium">02/06/2026 18:15:19</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">documentType</span>
                    <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 font-mono px-1.5 py-0.5 rounded font-bold">{card.documentType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">caseId</span>
                    <span className="text-[11px] font-mono font-semibold text-slate-700">{parsedPayload?.caseId || 'ca_98a72f1_boss'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">clientId</span>
                    <span className="text-[11px] font-mono font-semibold text-slate-700">{parsedPayload?.clientId || (card.category.toUpperCase() === 'PF' ? 'cli_pf_82a71' : 'cli_pj_44a29')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">clientType</span>
                    <span className="text-[11px] font-mono text-slate-700 font-bold">{card.category.toUpperCase()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">destinationFolderId recebido</span>
                    <span className="text-xs font-mono font-bold text-slate-800 truncate block max-w-xs">{normalizedData.destinationFolderId || '1_dRiVe_fOlDeR_ID_mOcK_991823'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">destinationFolderUrl recebido</span>
                    <span className="text-xs font-mono font-medium text-blue-650 truncate block max-w-xs">{normalizedData.destinationFolderUrl || 'https://drive.google.com/drive/folders/1_dRiVe_fOlDeR_ID_mOcK_991823'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1 bg-white">
                <button 
                  onClick={() => triggerCopy(rawPayloadText, 'payload')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copiar Payload</span>
                </button>
                <button 
                  onClick={handleReprocess}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-blue-100" />
                  <span>Reprocessar Job</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6. CARD — IDENTIFICAÇÃO DA AUTOMAÇÃO */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Settings className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identificação do Motor Documental</h3>
                <p className="text-[10px] text-slate-400">Dados do template e roteiro referenciador</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Nome da automação</span>
                  <span className="font-semibold text-slate-800">{getDocFriendlyName()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">documentType</span>
                  <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">{card.documentType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Tipo de Pessoa</span>
                  <span className="font-semibold text-slate-700">{card.category.toUpperCase() === 'PF' ? 'Pessoa Física (PF)' : 'Pessoa Jurídica (PJ)'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Origem Esperada</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    Portal BOSS Clientes
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Receptor</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    GDI — Google Docs Integrations
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 mt-1">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-400 block">Versão Config</span>
                    <span className="font-mono text-[10px] font-bold text-slate-600">v1.0.0</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-400 block">Última Modif.</span>
                    <span className="font-mono text-[10px] font-bold text-slate-600">02/06/2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7. CARD — TEMPLATE GOOGLE DOCS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileCode className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Template Vinculado no Google Docs</h3>
                  <p className="text-[10px] text-slate-400">Modelo mestre que receberá as substituições textuais</p>
                </div>
              </div>
              
              {/* Template state badge */}
              {templateStatus === 'validated' && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded">
                  Status: Validado
                </span>
              )}
              {templateStatus === 'configurado' && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded">
                  Status: Configurado
                </span>
              )}
              {templateStatus === 'não_configurado' && (
                <span className="bg-slate-100 text-slate-650 border border-slate-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded">
                  Não Configurado
                </span>
              )}
              {templateStatus === 'erro_template' && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded">
                  Erro no Modelo
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Error banner if erro_template */}
              {templateStatus === 'erro_template' && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[11px] uppercase font-mono tracking-wider">Erro Detectado (GDocs Model Validator)</p>
                    <p className="mt-0.5 text-xs text-rose-700 leading-normal">{templateError || 'Incapaz de ler o ID informado no Google API Connector.'}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">Nome de Exibição do Template</label>
                  <input 
                    type="text" 
                    value={card.id === 'procuracao-pf' ? "Procuração PF" : `Template Mestre Oficial de ${card.title}`} 
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 font-medium cursor-not-allowed text-xs" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">Google Docs Template ID</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={card.id === 'procuracao-pf' ? "16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk" : templateId} 
                      disabled={card.id === 'procuracao-pf'}
                      onChange={(e) => {
                        setTemplateId(e.target.value);
                        if(templateStatus === 'não_configurado') setTemplateStatus('configurado');
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Link de Edição do Google Docs</span>
                  <a 
                    href={card.id === 'procuracao-pf' ? "https://docs.google.com/document/d/16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk/edit?tab=t.0" : `https://docs.google.com/document/d/${templateId}/edit`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-blue-600 font-bold underline break-all flex items-center gap-1 hover:text-blue-700"
                  >
                    <span>Abrir Template no Google Docs</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  {card.id === 'procuracao-pf' && (
                    <a
                      href="https://drive.google.com/drive/u/0/folders/1fhMk2RMwEM7RlDCEOlKl5CsEjujX5zMJ"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-100 font-bold rounded-lg hover:bg-sky-100 transition cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Ver PDF Referência</span>
                    </a>
                  )}
                  <button 
                    onClick={() => {
                      alert(`Avaliando template "${card.id === 'procuracao-pf' ? '16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk' : templateId}" contra API Docs...`);
                      setTemplateStatus('validated');
                      setTemplateError('');
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    Validar
                  </button>
                </div>
              </div>

              {/* Guide about simulation validation dropdown */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span>Última validação efetuada: <strong className="text-slate-700">Hoje às 17:52:13</strong></span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">Simulador de status de erro do template:</span>
                  <select 
                    value={templateStatus === 'erro_template' ? simulationErrorType : 'validated'}
                    onChange={(e) => {
                      if(e.target.value === 'validated') {
                        setTemplateStatus('validated');
                        setTemplateError('');
                      } else {
                        setTemplateStatus('erro_template');
                        setTemplateError(getErrorTypeDetail(e.target.value).message);
                      }
                    }}
                    className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-xs font-mono text-slate-600 focus:outline-none"
                  >
                    <option value="validated">Sem erros (Validado)</option>
                    <option value="TEMPLATE_ID_MISSING">TEMPLATE_ID_MISSING</option>
                    <option value="TEMPLATE_NOT_FOUND">TEMPLATE_NOT_FOUND</option>
                    <option value="TEMPLATE_PERMISSION_DENIED">TEMPLATE_PERMISSION_DENIED</option>
                    <option value="TEMPLATE_PLACEHOLDERS_INVALID">TEMPLATE_PLACEHOLDERS_INVALID</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* 8. CARD — PLACEHOLDERS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Brackets className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mapeamento e Variáveis de Palavras-Chave (Placeholders)</h3>
                  <p className="text-[10px] text-slate-400">Variáveis textuais em chaves duplas mapeados ao payload incoming</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Substituições automatizadas efetuadas pelo GDI no escopo do arquivo do editor. Campos obrigatórios impedem processamento parcial em caso de nulos.
              </p>

              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full text-left text-xs text-slate-600 font-sans border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-400 tracking-wider font-mono border-b border-slate-150">
                      <th className="py-2.5 px-3">Marcador Google Docs</th>
                      <th className="py-2.5 px-3">Campo no Payload (BOSS)</th>
                      <th className="py-2.5 px-3">Obrigatório</th>
                      <th className="py-2.5 px-3">Valor de Teste</th>
                      <th className="py-2.5 px-3 text-right">Validação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {getMappedPlaceholders().map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-bold text-slate-700">{item.placeholder}</td>
                        <td className="py-2 px-3 text-blue-600 font-medium">{item.payloadField}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.mandatory === 'Sim' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                            {item.mandatory}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 truncate max-w-[120px]" title={item.example}>{item.example}</td>
                        <td className="py-2 px-3 text-right">
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] uppercase">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>



          {/* 10. MAPA DE VARIÁVEIS DO PORTAL BOSS (GDI LIVE ENGINE) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Mapa de Variáveis do Portal BOSS</h3>
                  <p className="text-[10px] text-slate-400">Sandbox dinâmico GDI: alteração de payload e normalização paralela</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="text-slate-400">Validação:</span>
                {isPayloadValid ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Saneado (Leitura OK)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Erro / Incompleto
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              O Portal BOSS Clientes armazena e envia dados. O GDI recebe este conteúdo em matrizes mistas (<code className="font-mono text-amber-700 bg-amber-50">pfData</code> / <code className="font-mono text-amber-700 bg-amber-50">pfDadosPessoais</code>, etc). O validador unifica e cria aliases amigáveis mantendo o sigilo e segurança síncrona.
            </p>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg flex items-start gap-2.5">
              <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-normal space-y-1">
                <p><strong className="font-bold">Contrato de Armazenamento:</strong> Os campos <code className="font-mono bg-blue-100 px-0.5 text-blue-900">destinationFolderId</code> e <code className="font-mono bg-blue-100 px-0.5 text-blue-900">destinationFolderUrl</code> são recebidos dinamicamente da carga útil (payload) do Portal BOSS. Eles <strong className="font-bold underline text-blue-900">NÃO são configurados manualmente no GDI</strong>.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-blue-950">
                  <div>• ID Ausente: <span className="font-bold text-rose-800">DESTINATION_FOLDER_ID_MISSING</span></div>
                  <div>• URL Ausente: <span className="font-bold text-rose-800">DESTINATION_FOLDER_URL_MISSING</span></div>
                  <div>• Escrita Negada: <span className="font-bold text-rose-800">DESTINATION_FOLDER_PERMISSION_DENIED</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Col 1: Dados Crus Recebidos (Editor) */}
              <div className="space-y-1.5 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">1. Dados Crus (JSON Editável)</span>
                  {parseError ? (
                    <span className="text-[9px] text-rose-600 font-mono font-bold bg-rose-50 px-1 border border-rose-100 rounded">Sintaxe Inválida</span>
                  ) : (
                    <span className="text-[9px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1 border border-emerald-100 rounded">Sintaxe JSON OK</span>
                  )}
                </div>
                <textarea
                  value={rawPayloadText}
                  onChange={(e) => setRawPayloadText(e.target.value)}
                  className="w-full h-80 bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-[10px] leading-relaxed border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none select-text"
                  placeholder="Cole aqui o payload JSON..."
                />
                <p className="text-[9px] text-slate-400 italic">
                  * Altere nomes ou valores em qualquer nó acima para ver os placeholders de teste mudarem instantaneamente!
                </p>
              </div>

              {/* Col 2: Dados Normalizados */}
              <div className="space-y-1.5 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">2. Payload GDI Normalizado</span>
                  <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono font-bold border border-blue-150">Saída em Barramento</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg h-80 overflow-y-auto p-3 font-mono text-[10px] text-emerald-400 leading-relaxed shadow-inner">
                  <pre>{JSON.stringify(normalizedData, null, 2)}</pre>
                </div>
                <p className="text-[9px] text-slate-400 italic">
                  * Segurança estrita: Senhas de acesso e outras credenciais privadas são excluídas do barramento.
                </p>
              </div>
            </div>

            {/* Diagnostics details for required and absent fields */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
              <h4 className="text-[10px] uppercase font-bold text-slate-600 tracking-wider font-mono">3. Auditoria e Diagnose de Variáveis</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Required Minimum variables check */}
                <div className="bg-white border border-slate-150 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-700">Mínimo Técnico Obrigatório</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Status</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(card.category.toUpperCase() === 'PF' ? PF_MANDATORY_FIELDS : PJ_MANDATORY_FIELDS).map((field) => {
                      const isFieldPushed = card.category.toUpperCase() === 'PF' 
                        ? !!normalizedData.pf[field] 
                        : (field.startsWith('pj_') ? !!normalizedData.pj[field] : !!normalizedData.representante[field]);
                      return (
                        <div key={field} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-600 truncate max-w-[150px]">{field}</span>
                          {isFieldPushed ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 rounded text-[9px] uppercase">
                              Preenchido
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1 bg-rose-50 px-1.5 rounded text-[9px] uppercase animate-pulse">
                              Ausente
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Absent Optional variables list */}
                <div className="bg-white border border-slate-150 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-700">Campos Facultativos Ausentes</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Auditoria GDI</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {mapperResult.validation.absentFields.length > 0 ? (
                      mapperResult.validation.absentFields.slice(0, 15).map((field) => (
                        <div key={field} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-500 line-through decoration-slate-300 truncate max-w-[150px]">{field}</span>
                          <span className="text-amber-600 font-medium bg-amber-50 px-1.5 rounded text-[9px] uppercase">Em branco</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-center py-4 italic text-[11px]">
                        Nenhum campo facultativo ausente. Payload 100% preenchido!
                      </div>
                    )}
                    {mapperResult.validation.absentFields.length > 15 && (
                      <div className="text-[10px] text-slate-400 text-right mt-1">
                        + {mapperResult.validation.absentFields.length - 15} outros...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status report blocks */}
              {!isPayloadValid && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 flex gap-2.5 items-start">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-800">Falha Crítica na Matriz de Encomenda</h5>
                    <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                      {parseError ? `Sintaxe de dados desregulada: ${parseError}` : mapperResult.validation.errorMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 11. CARD — RETORNO AO PORTAL BOSS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contrato de Saída (Retorno ao Portal BOSS)</h3>
                  <p className="text-[10px] text-slate-400">Resposta síncrona ou webhook de feedback do GDI</p>
                </div>
              </div>
              <button 
                onClick={() => triggerCopy(simulationStatus === 'success' ? getCallbackSuccessJson() : getCallbackFailureJson(simulationErrorType, getErrorTypeDetail(simulationErrorType).message), 'callback')}
                className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
              >
                <Copy className="h-3 w-3" />
                <span>Copiar JSON</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Após criação do arquivo, o GDI responde com a URL final do documento arquivado. Em caso de intercorrência, devolve o código de erro rastreável para que o Portal possa catalogar no histórico do cliente.
              </p>

              {/* Show different returning payload mock matching current simulator state */}
              <div className="bg-slate-900 rounded-xl overflow-hidden text-slate-300 p-4 font-mono text-[11px] leading-relaxed max-h-[280px] overflow-y-auto shadow-inner relative">
                <div className="absolute top-2 right-2 text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-sans uppercase">
                  RETORNO: {simulationStatus.toUpperCase()}
                </div>
                <pre>
                  {simulationStatus === 'success' 
                    ? getCallbackSuccessJson() 
                    : getCallbackFailureJson(simulationErrorType, getErrorTypeDetail(simulationErrorType).message)
                  }
                </pre>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: TEST TRIGGERS, CHECKS, DIAGNOSTICS, LOGS AND REPROCESSING */}
        <div className="lg:col-span-5 space-y-6">

          {/* 5. CARD — DIAGNÓSTICO DA INTEGRAÇÃO */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2.5 mb-2.5 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Settings2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Diagnóstico da Integração (10 Etapas GDI)</h3>
                <p className="text-[10px] text-slate-400">Varreduras e rastreios automáticos para aprovação da automação</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans">
              
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50 p-2.5 rounded-lg mb-2 flex justify-between items-center">
                <span>Passo Verificação</span>
                <span className="text-right">Status do Motor</span>
              </div>

              {[
                { label: 'GDI recebeu payload?', val: diagnosticSteps.received },
                { label: 'documentType é válido?', val: diagnosticSteps.docTypeValid },
                { label: 'template está configurado?', val: diagnosticSteps.templateConfigured },
                { label: 'placeholders estão mapeados?', val: diagnosticSteps.placeholdersMapped },
                { label: 'Pasta recebida do Portal BOSS (aguardando payload)?', val: diagnosticSteps.destinationIdReceived },
                { label: 'GDI tem permissão na pasta recebida?', val: diagnosticSteps.gdiHasPermission },
                { label: 'documento foi criado?', val: diagnosticSteps.docCreated },
                { label: 'documento foi salvo na pasta do Drive?', val: diagnosticSteps.savedToFolder },
                { label: 'resultado foi preparado?', val: diagnosticSteps.resultPrepared },
                { label: 'resultado foi devolvido ao Portal BOSS?', val: diagnosticSteps.returnedToBoss },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 text-[11px]">
                  <span className={`font-medium ${item.val ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{item.label}</span>
                  {item.val ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1 font-mono text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> [ OK ]
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600 flex items-center gap-1 font-mono text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> [ FALHA ]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 6. CARD — TESTES MÍNIMOS */}
          <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-md">
            <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/25 text-blue-400 flex items-center justify-center">
                <Play className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Centro de Simulação de Integração</h3>
                <p className="text-[10px] text-slate-400">Sandbox interativo para testes de fluxo GDI ⇄ BOSS</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[11px] text-slate-400 leading-normal">
                Dispare simulações locais rápidas para validar regras, checar o diagnóstico virtual e analisar contratos de respostas decorrentes de erros comuns.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button 
                  onClick={() => {
                    handleSimulateSuccess();
                    alert(`Simulando recebimento de payload de ${card.title} vindo do Portal BOSS Clientes...\n\nStatus: SUCESSO.`);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/60 rounded-lg text-left font-semibold font-sans flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-emerald-400 font-mono text-[9px] uppercase font-bold mb-1">Passo Inicial</span>
                  <span>Testar payload exemplo</span>
                </button>
                <button 
                  onClick={() => {
                    alert(`Varrendo correspondência das variáveis do Docs de ${card.id}...\n\nChaves analisadas: OK\nPlaceholders no Docs e Payload estão balanceados.`);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/60 rounded-lg text-left font-semibold font-sans flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-purple-400 font-mono text-[9px] uppercase font-bold mb-1">Campos Adjacentes</span>
                  <span>Mapeamento placeholders</span>
                </button>
                <button 
                  onClick={() => {
                    setTemplateStatus('validated');
                    setTemplateError('');
                    alert(`Google API Connector: ID do template verificado com sucesso.\nID: ${card.id === 'procuracao-pf' ? '16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk' : templateId}\nStatus: Ativo, Permissão de Leitura Confeccionada.`);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/60 rounded-lg text-left font-semibold font-sans flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-amber-400 font-mono text-[9px] uppercase font-bold mb-1">Nuvem Google</span>
                  <span>Testar Template</span>
                </button>
                <button 
                  onClick={() => {
                    alert(`Verificando permissões de escrita na pasta recebida do drive: "${normalizedData.destinationFolderId || '1_dRiVe_fOlDeR_ID_mOcK_991823'}"\n\nGoogle Drive API: Pasta existente e autorização confirmada.`);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/60 rounded-lg text-left font-semibold font-sans flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-blue-400 font-mono text-[9px] uppercase font-bold mb-1">Armazenamento</span>
                  <span>Testar Pasta Recebida</span>
                </button>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Simuladores Rápidos Globais</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      handleSimulateSuccess();
                      alert('Simulação de Sucesso Concluída! Todos os checklists de diagnóstico estão verdes.');
                    }}
                    className="flex-1 py-2 bg-emerald-600/25 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-lg font-bold text-center transition cursor-pointer"
                  >
                    Simular Sucesso (200 OK)
                  </button>
                  <button 
                    onClick={() => {
                      handleSimulateFailure();
                      alert(`Simulação de Falha Concluída! Erro ativo: "${simulationErrorType}".\nVeja o diagnóstico e a caixa de erro abaixo.`);
                    }}
                    className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 rounded-lg font-bold text-center transition cursor-pointer"
                  >
                    Simular Falha
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2.5 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono">Tipo de erro a aplicar na falha:</span>
                  <select 
                    value={simulationErrorType}
                    onChange={(e) => {
                      setSimulationErrorType(e.target.value);
                      if (simulationStatus === 'failed') {
                        handleSimulateFailure(e.target.value);
                      }
                    }}
                    className="flex-1 max-w-[200px] border border-slate-700 rounded px-2 py-1 bg-slate-850 text-xs font-mono text-slate-300 focus:outline-none"
                  >
                    <option value="PAYLOAD_EMPTY">PAYLOAD_EMPTY</option>
                    <option value="DOCUMENT_TYPE_MISSING">DOCUMENT_TYPE_MISSING</option>
                    <option value="DOCUMENT_TYPE_INVALID">DOCUMENT_TYPE_INVALID</option>
                    <option value="CASE_ID_MISSING">CASE_ID_MISSING</option>
                    <option value="CLIENT_ID_MISSING">CLIENT_ID_MISSING</option>
                    <option value="CLIENT_DATA_MISSING">CLIENT_DATA_MISSING</option>
                    <option value="DESTINATION_FOLDER_ID_MISSING">DESTINATION_FOLDER_ID_MISSING</option>
                    <option value="DESTINATION_FOLDER_URL_MISSING">DESTINATION_FOLDER_URL_MISSING</option>
                    <option value="DESTINATION_FOLDER_PERMISSION_DENIED">DESTINATION_FOLDER_PERMISSION_DENIED</option>
                    <option value="DESTINATION_FOLDER_NOT_FOUND">DESTINATION_FOLDER_NOT_FOUND</option>
                    <option value="TEMPLATE_ID_MISSING">TEMPLATE_ID_MISSING</option>
                    <option value="TEMPLATE_NOT_FOUND">TEMPLATE_NOT_FOUND</option>
                    <option value="TEMPLATE_PERMISSION_DENIED">TEMPLATE_PERMISSION_DENIED</option>
                    <option value="TEMPLATE_PLACEHOLDERS_INVALID">TEMPLATE_PLACEHOLDERS_INVALID</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 7. CARD — REPROCESSAMENTO */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2.5 mb-2.5 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <RefreshCw className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Controles de Reprocessamento</h3>
                <p className="text-[10px] text-slate-400">Parâmetros de contingência e retry mecânico</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              <p className="text-xs text-slate-500 leading-normal">
                Dispare ordens manuais para recalcular e rechecar payloads interrompidos por falha de tempo limite, indisponibilidade do Google Drive API ou permissão temporária negada.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-150 font-mono text-[11px]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">retryCount</span>
                  <span className="font-bold text-slate-800">{retryCount} tentativas</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">lastRetryAt</span>
                  <span className="font-bold text-slate-800">{lastRetryAt}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200 pt-2 mt-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Motivo catalogado</span>
                  <input 
                    type="text" 
                    value={reprocessReason} 
                    onChange={(e) => setReprocessReason(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <button 
                onClick={handleReprocess}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white font-bold text-center rounded-lg shadow-2xs transition active:scale-[99%] cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reprocessar Job MANUALMENTE</span>
              </button>
            </div>
          </div>

          {/* 8. CARD — ANTI-DUPLICIDADE */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2.5 mb-2.5 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mecanismo Anti-Duplicidade</h3>
                <p className="text-[10px] text-slate-400">Verificação para evitar redundância e gasto desnecessário de Google Docs API</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <p className="text-xs text-slate-500 leading-normal">
                Antes de iniciar a geração, o GDI escaneia o banco de dados e a pasta do Google Drive em busca de arquivos criados com os mesmos parâmetros (<code className="font-mono bg-slate-50">caseId</code> + <code className="font-mono bg-slate-50">documentType</code>) ou mesmo nome de arquivo físico no diretório destino.
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Documento idêntico localizado?</span>
                  <span className={`font-mono font-bold ${existingDocConflict ? 'text-amber-600 flex items-center gap-1' : 'text-slate-500'}`}>
                    {existingDocConflict ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        CONFLITO DETECTADO
                      </>
                    ) : 'Nenhum'}
                  </span>
                </div>
                
                {existingDocConflict && (
                  <div className="bg-amber-100 border border-amber-200 text-amber-900 p-2.5 rounded text-[11px] leading-normal font-sans">
                    Um documento para <strong className="text-slate-900">Case #2026-98745</strong> com documentType <strong className="text-slate-900">{card.documentType}</strong> já foi gerado no Google Docs em 02/06/2026 às 17:52:19.
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-slate-400 font-mono">Simular colisão de arquivamento:</span>
                  <button 
                    onClick={() => setExistingDocConflict(prev => !prev)}
                    className="px-2 py-1 rounded bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    {existingDocConflict ? 'Solucionar Colisão' : 'Forçar Conflito'}
                  </button>
                </div>
              </div>

              {/* Resolution options */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Ação automática em caso de colisão</span>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`border rounded-lg p-2.5 flex items-start gap-2.5 hover:bg-slate-50 cursor-pointer ${antiDuplicitySetting === 'alert' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="antidup" 
                      checked={antiDuplicitySetting === 'alert'}
                      onChange={() => setAntiDuplicitySetting('alert')}
                      className="mt-0.5" 
                    />
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-slate-700">Bloquear e Alertar Operador</p>
                      <p className="text-slate-500 text-[11px]">Para a execução atual e solicita intervenção manual no BOSS.</p>
                    </div>
                  </label>
                  <label className={`border rounded-lg p-2.5 flex items-start gap-2.5 hover:bg-slate-50 cursor-pointer ${antiDuplicitySetting === 'new_version' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="antidup" 
                      checked={antiDuplicitySetting === 'new_version'}
                      onChange={() => setAntiDuplicitySetting('new_version')}
                      className="mt-0.5" 
                    />
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-slate-700">Substituir / Gerar Nova Versão</p>
                      <p className="text-slate-500 text-[11px]">Adiciona sufixo [v2, v3...] de versão no nome do arquivo final.</p>
                    </div>
                  </label>
                  <label className={`border rounded-lg p-2.5 flex items-start gap-2.5 hover:bg-slate-50 cursor-pointer ${antiDuplicitySetting === 'cancel' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="antidup" 
                      checked={antiDuplicitySetting === 'cancel'}
                      onChange={() => setAntiDuplicitySetting('cancel')}
                      className="mt-0.5" 
                    />
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-slate-700">Cancelar sumariamente (Silencioso)</p>
                      <p className="text-slate-500 text-[11px]">Cancela a geração e apenas devolve o link do Docs existente.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 9. CARD — CRITÉRIO DE SUCESSO */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 font-sans">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Critério de Avaliação</span>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-normal">Critério de Sucesso da Automação</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              A automação de <strong className="text-slate-700">{getDocFriendlyName()}</strong> só será considerada concluída com sucesso quando os <strong className="text-slate-700">10 itens do diagnóstico forem aprovados sequencialmente</strong> e o feedback HTTP 200 for processado com recepção íntegra na respectiva instância no Portal BOSS.
            </p>
          </div>

          {/* 10. CARDS — LOGS */}
          <div className="space-y-6">
            
            {/* LOGS DE FALHA */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center space-x-2.5 mb-3 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histórico de Erros Detalhados</h3>
                  <p className="text-[10px] text-slate-400">Falhas catalogadas em tempo de processamento</p>
                </div>
              </div>

              {simulationStatus === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center flex flex-col items-center justify-center text-xs">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2" />
                  <p className="font-bold text-emerald-800">Nenhum Erro Ativo</p>
                  <p className="text-emerald-600 text-[11px] mt-1">O motor GDI está rodando estavelmente nas simulações correspondentes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-rose-900 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded uppercase">
                        CÓDIGO: {getErrorTypeDetail(simulationErrorType).code}
                      </span>
                      <span className="text-[10px] font-mono text-rose-600 font-bold">{getErrorTypeDetail(simulationErrorType).step}</span>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-xs text-rose-900">Mensagem catalogada:</h5>
                      <p className="text-xs text-rose-800 leading-normal font-sans mt-0.5">“{getErrorTypeDetail(simulationErrorType).message}”</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-[10px] uppercase font-mono text-rose-900/60">Etapa de Falha e Diagnóstico:</h5>
                      <p className="text-xs text-rose-800 font-sans mt-0.5">{getErrorTypeDetail(simulationErrorType).reason}</p>
                    </div>

                    <div className="bg-rose-900 text-rose-100 font-mono text-[10px] p-3 rounded-lg overflow-x-auto shadow-inner select-all leading-normal">
                      <span className="text-[8px] bg-rose-800 px-1 py-0.5 rounded text-rose-300 font-sans block w-fit mb-1 font-bold uppercase">Technical Stack Tracer</span>
                      <pre className="break-all">{getErrorTypeDetail(simulationErrorType).stack}</pre>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => triggerCopy(getErrorTypeDetail(simulationErrorType).message, 'error')}
                        className="px-2.5 py-1.5 bg-white hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-900 rounded font-bold text-[11px] transition cursor-pointer flex-1 text-center"
                      >
                        Copiar Erro
                      </button>
                      <button 
                        onClick={() => triggerCopy(getPayloadContractJson(), 'payload')}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[11px] transition cursor-pointer flex-1 text-center"
                      >
                        Copiar Payload
                      </button>
                      <button 
                        onClick={handleReprocess}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded font-bold text-[11px] transition cursor-pointer flex-1 text-center"
                      >
                        Reprocessar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LOGS DE SUCESSO */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center space-x-2.5 mb-3 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <History className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histórico de Passos Logados</h3>
                  <p className="text-[10px] text-slate-400">Logs de eventos (webhooks) cronologicamente listados</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-[11px] leading-normal text-slate-600 max-h-[300px] overflow-y-auto pr-1">
                {performanceLogs.map((log, index) => (
                  <div key={index} className="border-l-2 border-slate-200 pl-3.5 py-1 relative">
                    <span className={`absolute left-[-5px] top-2 h-2.5 w-2.5 rounded-full border border-white ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>{log.timestamp}</span>
                      <span className={`font-bold uppercase tracking-wider ${log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{log.step}</span>
                    </div>
                    <p className="font-bold text-slate-800">{log.message}</p>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
