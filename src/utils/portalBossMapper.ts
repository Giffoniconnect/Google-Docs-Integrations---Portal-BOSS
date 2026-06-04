export interface PortalBossPayload {
  documentType?: string;
  caseId?: string;
  clientId?: string;
  clientType?: 'PF' | 'PJ' | string;
  source?: string;
  target?: string;
  destinationFolderId?: string;
  destinationFolderUrl?: string;
  payload?: Record<string, any>;
  clientRawData?: {
    pfData?: Record<string, any>;
    pfDadosPessoais?: Record<string, any>;
    pjData?: Record<string, any>;
    pjDadosEmpresa?: Record<string, any>;
    socioData?: Record<string, any>;
    socioDadosPessoais?: Record<string, any>;
    bancarioData?: Record<string, any>;
    bancarioDadosBancarios?: Record<string, any>;
    acessosistema?: Record<string, any>; // lowercase fallback
    acessoSistema?: Record<string, any>;
  };
  caseData?: Record<string, any>;
  officeData?: {
    localAssinatura?: string;
    advogadoNome?: string;
    advogadoOab?: string;
    dataAssinatura?: string;
    [key: string]: any;
  };
}

// Normalized output structure for GDI
export interface NormalizedGdiData {
  documentType: string;
  caseId: string;
  clientId: string;
  clientType: 'PF' | 'PJ';
  destinationFolderId: string;
  destinationFolderUrl: string;
  pf: Record<string, any>;
  pj: Record<string, any>;
  representante: Record<string, any>;
  bancario: Record<string, any>;
  acesso: Record<string, any>;
  caso: Record<string, any>;
  escritorio: Record<string, any>;
}

// Log structure matching GDI requirements
export interface GdiLogEntry {
  timestamp: string;
  step: string;
  status: 'success' | 'failed';
  message: string;
  details: string;
}

// Mapping rule item for helper checks
export interface FieldMappingRule {
  key: string;
  alias: string;
  label: string;
}

// Helper to get present date and time in localized string format
export function getFormattedNow(): string {
  const now = new Date();
  return now.toLocaleString('pt-BR');
}

// Map definition for PF fields and their aliases
export const PF_FIELD_RULES: FieldMappingRule[] = [
  { key: 'pf_nomeCompleto', alias: 'nomeCompleto', label: 'Nome Completo' },
  { key: 'pf_cpf', alias: 'cpf', label: 'CPF' },
  { key: 'pf_rg', alias: 'rg', label: 'RG' },
  { key: 'pf_orgaoEmissor', alias: 'orgaoEmissor', label: 'Órgão Emissor' },
  { key: 'pf_dataEmissao', alias: 'dataEmissao', label: 'Data de Emissão' },
  { key: 'pf_nascimento', alias: 'dataNascimento', label: 'Data de Nascimento' },
  { key: 'pf_nacionalidade', alias: 'nacionalidade', label: 'Nacionalidade' },
  { key: 'pf_estadoCivil', alias: 'estadoCivil', label: 'Estado Civil' },
  { key: 'pf_profissao', alias: 'profissao', label: 'Profissão' },
  { key: 'pf_telefone', alias: 'telefone', label: 'Telefone' },
  { key: 'pf_whatsapp', alias: 'whatsapp', label: 'WhatsApp' },
  { key: 'pf_email', alias: 'email', label: 'E-mail' },
  { key: 'pf_cep', alias: 'cep', label: 'CEP' },
  { key: 'pf_endereco', alias: 'endereco', label: 'Endereço (Logradouro)' },
  { key: 'pf_numero', alias: 'numero', label: 'Número' },
  { key: 'pf_complemento', alias: 'complemento', label: 'Complemento' },
  { key: 'pf_bairro', alias: 'bairro', label: 'Bairro' },
  { key: 'pf_cidade', alias: 'cidade', label: 'Cidade' },
  { key: 'pf_estado', alias: 'estado', label: 'Estado (UF)' }
];

// Map definition for PJ fields and their aliases
export const PJ_FIELD_RULES: FieldMappingRule[] = [
  { key: 'pj_razaoSocial', alias: 'razaoSocial', label: 'Razão Social' },
  { key: 'pj_nomeFantasia', alias: 'nomeFantasia', label: 'Nome Fantasia' },
  { key: 'pj_cnpj', alias: 'cnpj', label: 'CNPJ' },
  { key: 'pj_inscricaoEstadual', alias: 'inscricaoEstadual', label: 'Inscrição Estadual' },
  { key: 'pj_inscricaoMunicipal', alias: 'inscricaoMunicipal', label: 'Inscrição Municipal' },
  { key: 'pj_emailEmpresa', alias: 'emailEmpresa', label: 'E-mail Corporativo' },
  { key: 'pj_telefoneEmpresa', alias: 'telefoneEmpresa', label: 'Telefone da Empresa' },
  { key: 'pj_whatsappEmpresa', alias: 'whatsappEmpresa', label: 'WhatsApp da Empresa' },
  { key: 'pj_cepEmpresa', alias: 'cepEmpresa', label: 'CEP' },
  { key: 'pj_enderecoEmpresa', alias: 'enderecoEmpresa', label: 'Endereço da Empresa' },
  { key: 'pj_numeroEmpresa', alias: 'numeroEmpresa', label: 'Número' },
  { key: 'pj_complementoEmpresa', alias: 'complementoEmpresa', label: 'Complemento' },
  { key: 'pj_bairroEmpresa', alias: 'bairroEmpresa', label: 'Bairro' },
  { key: 'pj_cidadeEmpresa', alias: 'cidadeEmpresa', label: 'Cidade' },
  { key: 'pj_estadoEmpresa', alias: 'estadoEmpresa', label: 'Estado (UF)' }
];

// Map definition for Sócio/Representante fields and their aliases
export const SOCIO_FIELD_RULES: FieldMappingRule[] = [
  { key: 'socio_nomeCompleto', alias: 'representanteNomeCompleto', label: 'Nome Completo Sócio' },
  { key: 'socio_cpf', alias: 'representanteCpf', label: 'CPF Sócio' },
  { key: 'socio_rg', alias: 'representanteRg', label: 'RG Sócio' },
  { key: 'socio_orgaoEmissor', alias: 'representanteOrgaoEmissor', label: 'Órgão Emissor Sócio' },
  { key: 'socio_dataEmissao', alias: 'representanteDataEmissao', label: 'Data de Emissão' },
  { key: 'socio_nascimento', alias: 'representanteNascimento', label: 'Data de Nascimento' },
  { key: 'socio_nacionalidade', alias: 'representanteNacionalidade', label: 'Nacionalidade Sócio' },
  { key: 'socio_estadoCivil', alias: 'representanteEstadoCivil', label: 'Estado Civil Sócio' },
  { key: 'socio_profissao', alias: 'representanteProfissao', label: 'Profissão Sócio' },
  { key: 'socio_telefone', alias: 'representanteTelefone', label: 'Telefone Sócio' },
  { key: 'socio_whatsapp', alias: 'representanteWhatsapp', label: 'WhatsApp Sócio' },
  { key: 'socio_email', alias: 'representanteEmail', label: 'E-mail Sócio' },
  { key: 'socio_cep', alias: 'representanteCep', label: 'CEP Sócio' },
  { key: 'socio_endereco', alias: 'representanteEndereco', label: 'Endereço Sócio' },
  { key: 'socio_numero', alias: 'representanteNumero', label: 'Número Sócio' },
  { key: 'socio_complemento', alias: 'representanteComplemento', label: 'Complemento Sócio' },
  { key: 'socio_bairro', alias: 'representanteBairro', label: 'Bairro Sócio' },
  { key: 'socio_cidade', alias: 'representanteCidade', label: 'Cidade Sócio' },
  { key: 'socio_estado', alias: 'representanteEstado', label: 'Estado (UF) Sócio' }
];

// Map definition for Banking fields and their aliases
export const BANKING_FIELD_RULES: FieldMappingRule[] = [
  { key: 'bancario_possuiDadosBancarios', alias: 'possuiDadosBancarios', label: 'Possui Dados Bancários' },
  { key: 'bancario_tipoChavePix', alias: 'tipoChavePix', label: 'Tipo Chave PIX' },
  { key: 'bancario_chavePix', alias: 'chavePix', label: 'Chave PIX' },
  { key: 'bancario_bancoPix', alias: 'bancoPix', label: 'Banco do PIX' },
  { key: 'bancario_titularPix', alias: 'titularPix', label: 'Titular PIX' },
  { key: 'bancario_titularEhCliente', alias: 'titularEhCliente', label: 'Titular é o Próprio Cliente' },
  { key: 'bancario_titularConta', alias: 'titularConta', label: 'Titular da Conta Bancária' },
  { key: 'bancario_banco', alias: 'banco', label: 'Banco' },
  { key: 'bancario_agencia', alias: 'agencia', label: 'Agência' },
  { key: 'bancario_numeroConta', alias: 'numeroConta', label: 'Número da Conta' },
  { key: 'bancario_operacao', alias: 'operacao', label: 'Operação Bancária' }
];

// Map definition for Acesso fields and their aliases
export const ACESSO_FIELD_RULES: FieldMappingRule[] = [
  { key: 'acesso_emailLogin', alias: 'emailLogin', label: 'E-mail de Login' },
  { key: 'acesso_statusAcesso', alias: 'statusAcesso', label: 'Status do Acesso' }
];

// PF Obligatory min fields
export const PF_MANDATORY_FIELDS = [
  'pf_nomeCompleto',
  'pf_cpf',
  'pf_email',
  'pf_telefone',
  'pf_cep',
  'pf_endereco'
];

// PJ Obligatory min fields (both PJ enterprise and Representante socio)
export const PJ_MANDATORY_FIELDS = [
  'pj_razaoSocial',
  'pj_cnpj',
  'pj_emailEmpresa',
  'pj_telefoneEmpresa',
  'pj_cepEmpresa',
  'pj_enderecoEmpresa',
  'socio_nomeCompleto',
  'socio_cpf'
];

/**
 * Normalizes any incoming Portal BOSS data payload into GDI standard schema.
 * Reconciles the duplicate technical fields (e.g. pfData vs pfDadosPessoais).
 * Maps both core keys and their descriptive aliases.
 */
export function normalizePortalBossPayload(payload: PortalBossPayload): {
  normalized: NormalizedGdiData;
  logs: GdiLogEntry[];
  validation: {
    isValid: boolean;
    missingMandatory: string[];
    absentFields: string[];
    errorType?: string;
    errorMessage?: string;
  };
} {
  const logs: GdiLogEntry[] = [];
  const timestamp = getFormattedNow();

  // 1. Log payload reception
  logs.push({
    timestamp,
    step: 'GDI_PORTAL_PAYLOAD_RECEIVED',
    status: 'success',
    message: 'Payload do Portal BOSS recebido para normalização técnica',
    details: `Sistemas: [${payload?.source || 'Portal BOSS'} ➔ ${payload?.target || 'GDI'}]. documentType: "${payload?.documentType || 'ausente'}"`
  });

  // Check if payload is empty/null
  if (!payload || Object.keys(payload).length === 0) {
    return createFailureResult('PAYLOAD_EMPTY', 'O payload de dados recebido está vazio ou corrompido.', logs);
  }

  // Normalize flat payload to clientRawData if clientRawData doesn't exist and payload.payload exists
  if (!payload.clientRawData && payload.payload) {
    const flatPayload = payload.payload;
    payload.clientRawData = {
      pfData: flatPayload,
      pfDadosPessoais: flatPayload,
      bancarioData: flatPayload,
      bancarioDadosBancarios: flatPayload,
      acessoSistema: flatPayload,
      pjData: flatPayload,
      pjDadosEmpresa: flatPayload,
      socioData: flatPayload,
      socioDadosPessoais: flatPayload
    };
  }

  // Check required wrapper keys
  const documentType = payload.documentType || '';
  const caseId = payload.caseId || '';
  const clientId = payload.clientId || '';

  // Determine clientType with fallbacks
  let rawClientType = (payload.clientType || '').toUpperCase();
  if (!rawClientType) {
    if (documentType.toLowerCase().includes('pf') || (payload.payload && payload.payload.cpf)) {
      rawClientType = 'PF';
    } else if (documentType.toLowerCase().includes('pj') || (payload.payload && payload.payload.cnpj)) {
      rawClientType = 'PJ';
    }
  }
  const clientType = rawClientType;

  const destinationFolderId = payload.destinationFolderId || '';
  const destinationFolderUrl = payload.destinationFolderUrl || '';

  if (!documentType) {
    return createFailureResult('DOCUMENT_TYPE_MISSING', 'O campo "documentType" não foi fornecido na mensagem.', logs);
  }

  if (clientType !== 'PF' && clientType !== 'PJ') {
    return createFailureResult('CLIENT_TYPE_MISSING', 'Identificador técnico "clientType" inválido ou ausente no payload (deve ser PF ou PJ).', logs);
  }

  if (!caseId) {
    return createFailureResult('CASE_ID_MISSING', 'Falha técnica: O identificador de caso "caseId" do Portal BOSS não foi recebido.', logs);
  }

  if (!clientId) {
    return createFailureResult('CLIENT_ID_MISSING', 'Falha técnica: O identificador de cliente "clientId" está ausente no payload.', logs);
  }

  if (!payload.clientRawData) {
    return createFailureResult('CLIENT_DATA_MISSING', 'Falha técnica: O nó "clientRawData" contendo as chaves variáveis do cliente está nulo.', logs);
  }

  // 2. Map loaded variables logs
  logs.push({
    timestamp,
    step: 'GDI_VARIABLE_MAP_LOADED',
    status: 'success',
    message: 'Estruturação base da matriz portalBossVariableMap carregada',
    details: `Normalizando dados de cliente ID: ${clientId} sob classificador ${clientType}`
  });

  // Extract raw source sections with alternative/duplicate keys matching PORTAL BOSS specs
  const rawData = payload.clientRawData;
  const pfRaw = rawData.pfData || rawData.pfDadosPessoais || {};
  const pjRaw = rawData.pjData || rawData.pjDadosEmpresa || {};
  const socioRaw = rawData.socioData || rawData.socioDadosPessoais || {};
  const bancarioRaw = rawData.bancarioData || rawData.bancarioDadosBancarios || {};
  const acessoRaw = rawData.acessoSistema || rawData.acessosistema || {};

  // Build internal records
  const pfDataNormalized: Record<string, any> = {};
  const pjDataNormalized: Record<string, any> = {};
  const socioDataNormalized: Record<string, any> = {};
  const bancarioDataNormalized: Record<string, any> = {};
  const acessoDataNormalized: Record<string, any> = {};

  const absentFields: string[] = [];

  // PF Normalization Logic
  PF_FIELD_RULES.forEach(rule => {
    // Check key, then check alias, then check without prefix if any
    let value = '';
    if (pfRaw[rule.key] !== undefined) {
      value = pfRaw[rule.key];
    } else if (pfRaw[rule.alias] !== undefined) {
      value = pfRaw[rule.alias];
    } else {
      absentFields.push(rule.key);
    }
    
    // Convert undefined/null to empty string
    const stringVal = value !== undefined && value !== null ? String(value) : '';
    
    // Store both in normalized object (as standard field AND alias to support absolute GDI redundancy rules)
    pfDataNormalized[rule.key] = stringVal;
    pfDataNormalized[rule.alias] = stringVal;
  });

  if (clientType === 'PF') {
    logs.push({
      timestamp,
      step: 'GDI_PF_FIELDS_MAPPED',
      status: 'success',
      message: 'Mapeamento e reconciliação dos campos de Pessoa Física (PF)',
      details: `Total de ${PF_FIELD_RULES.length} campos normalizados (` + 
               PF_FIELD_RULES.filter(r => pfDataNormalized[r.key]).length + ' preenchidos)'
    });
  }

  // PJ Normalization Logic
  PJ_FIELD_RULES.forEach(rule => {
    let value = '';
    if (pjRaw[rule.key] !== undefined) {
      value = pjRaw[rule.key];
    } else if (pjRaw[rule.alias] !== undefined) {
      value = pjRaw[rule.alias];
    } else {
      absentFields.push(rule.key);
    }
    const stringVal = value !== undefined && value !== null ? String(value) : '';
    pjDataNormalized[rule.key] = stringVal;
    pjDataNormalized[rule.alias] = stringVal;
  });

  // Representante Sócio Normalization Logic
  SOCIO_FIELD_RULES.forEach(rule => {
    let value = '';
    if (socioRaw[rule.key] !== undefined) {
      value = socioRaw[rule.key];
    } else if (socioRaw[rule.alias] !== undefined) {
      value = socioRaw[rule.alias];
    } else {
      absentFields.push(rule.key);
    }
    const stringVal = value !== undefined && value !== null ? String(value) : '';
    socioDataNormalized[rule.key] = stringVal;
    socioDataNormalized[rule.alias] = stringVal;
  });

  if (clientType === 'PJ') {
    logs.push({
      timestamp,
      step: 'GDI_PJ_FIELDS_MAPPED',
      status: 'success',
      message: 'Mapeamento dos campos corporativos de Pessoa Jurídica (PJ)',
      details: `Total de ${PJ_FIELD_RULES.length} campos de Razão Social normalizados`
    });
    logs.push({
      timestamp,
      step: 'GDI_SOCIO_FIELDS_MAPPED',
      status: 'success',
      message: 'Mapeamento do Sócio Administrador / Representante legal',
      details: `Campos de qualificação civil mapeados: ${SOCIO_FIELD_RULES.length} chaves registradas`
    });
  }

  // Banking Normalization Logic
  BANKING_FIELD_RULES.forEach(rule => {
    let value: any = '';
    if (bancarioRaw[rule.key] !== undefined) {
      value = bancarioRaw[rule.key];
    } else if (bancarioRaw[rule.alias] !== undefined) {
      value = bancarioRaw[rule.alias];
    } else {
      absentFields.push(rule.key);
    }

    if (rule.key === 'bancario_possuiDadosBancarios' || rule.key === 'bancario_titularEhCliente') {
      const boolVal = value === true || value === 'true' || value === 'Sim' || value === 1;
      bancarioDataNormalized[rule.key] = boolVal;
      bancarioDataNormalized[rule.alias] = boolVal;
    } else {
      const stringVal = value !== undefined && value !== null ? String(value) : '';
      bancarioDataNormalized[rule.key] = stringVal;
      bancarioDataNormalized[rule.alias] = stringVal;
    }
  });

  logs.push({
    timestamp,
    step: 'GDI_BANKING_FIELDS_MAPPED',
    status: 'success',
    message: 'Reconciliação das chaves bancárias e canais de cobrança (PIX/Contas)',
    details: bancarioDataNormalized.bancario_possuiDadosBancarios ? 'Dados bancários ativos localizados no payload.' : 'Dados de conta nulos ou inativos.'
  });

  // Acesso Normalization Logic (CRITICAL SECURITY MANDATE: EXCLUDE PASSWORDS)
  ACESSO_FIELD_RULES.forEach(rule => {
    let value = '';
    if (acessoRaw[rule.key] !== undefined) {
      value = acessoRaw[rule.key];
    } else if (acessoRaw[rule.alias] !== undefined) {
      value = acessoRaw[rule.alias];
    }
    const stringVal = value !== undefined && value !== null ? String(value) : '';
    acessoDataNormalized[rule.key] = stringVal;
    acessoDataNormalized[rule.alias] = stringVal;
  });

  // Ensure password-related keys are stripped or entirely neglected
  delete acessoDataNormalized.acesso_senha;
  delete acessoDataNormalized.senha;
  delete acessoDataNormalized.acessoSenha;
  delete (acessoDataNormalized as any).password;

  // Finished normalizer
  logs.push({
    timestamp,
    step: 'GDI_PORTAL_PAYLOAD_NORMALIZED',
    status: 'success',
    message: 'Camada de normalização efetuada e dados saneados com sucesso',
    details: `Formatado em modelo de barramento síncrono GDI (PF: ${clientType === 'PF'}, PJ: ${clientType === 'PJ'})`
  });

  // 3. Mandatory validations according to current clientType
  const missingMandatory: string[] = [];
  if (clientType === 'PF') {
    const isProcuracaoPf = documentType === 'procuracao_pf' || documentType === 'procuracao-pf';
    const mandatoryFields = isProcuracaoPf ? ['pf_nomeCompleto', 'pf_cpf'] : PF_MANDATORY_FIELDS;

    mandatoryFields.forEach(field => {
      const isFilled = pfDataNormalized[field] && pfDataNormalized[field].trim() !== '';
      if (!isFilled) {
        missingMandatory.push(field);
      }
    });

    if (missingMandatory.length > 0) {
      return createFailureResult(
        'GDI_PF_REQUIRED_FIELD_MISSING',
        `Falha de validação: Campos obrigatórios mínimos de PF ausentes: [${missingMandatory.join(', ')}]`,
        logs,
        missingMandatory,
        absentFields
      );
    }
  } else {
    // PJ checks
    PJ_MANDATORY_FIELDS.forEach(field => {
      let isFilled = false;
      if (field.startsWith('pj_')) {
        isFilled = pjDataNormalized[field] && pjDataNormalized[field].trim() !== '';
      } else if (field.startsWith('socio_')) {
        isFilled = socioDataNormalized[field] && socioDataNormalized[field].trim() !== '';
      }

      if (!isFilled) {
        missingMandatory.push(field);
      }
    });

    if (missingMandatory.length > 0) {
      return createFailureResult(
        'GDI_PJ_REQUIRED_FIELD_MISSING',
        `Falha de validação: Campos obrigatórios mínimos de PJ/Sócio ausentes: [${missingMandatory.join(', ')}]`,
        logs,
        missingMandatory,
        absentFields
      );
    }
  }

  // Required Field success log
  logs.push({
    timestamp,
    step: 'GDI_REQUIRED_FIELDS_VALIDATED',
    status: 'success',
    message: 'Campos obrigatórios mínimos preenchidos e validados com êxito',
    details: `Saneamento e checagem de preenchimento nulo: OK`
  });

  if (absentFields.length > 0) {
    logs.push({
      timestamp,
      step: 'GDI_MISSING_FIELDS_DETECTED',
      status: 'success', // logged as step success even if optional fields are missing
      message: 'Mecanismo de diagnóstico sinalizou campos opcionais não fornecidos',
      details: `${absentFields.length} chaves opcionais vieram em branco: [${absentFields.slice(0, 5).join(', ')}...]`
    });
  }

  // Dynamic Case and Office Data binding
  const casoSrc = payload.caseData || payload.payload || {};
  const escritorioSrc = payload.officeData || payload.payload || {};

  const casoData = {
    naturezaAcao: casoSrc.naturezaAcao || '',
    valorHonorarios: casoSrc.valorHonorarios || '',
    formaPagamento: casoSrc.formaPagamento || '',
    varaCompetente: casoSrc.varaCompetente || '',
    foroComarca: casoSrc.foroComarca || '',
    relatoFatos: casoSrc.relatoFatos || '',
    valorCausa: casoSrc.valorCausa || casoSrc.valorEstimado || '',
    ...casoSrc
  };

  const escritorioData = {
    localAssinatura: escritorioSrc.localAssinatura || 'Viçosa, MG',
    advogadoNome: escritorioSrc.advogadoNome || 'RODRIGO GIFFONI RODRIGUES',
    advogadoOab: escritorioSrc.advogadoOab || 'OAB/MG 157.320',
    dataAssinatura: escritorioSrc.dataAssinatura || getFormattedNow(),
    escritorioNome: escritorioSrc.escritorioNome || 'Giffoni & Associados Advocacia'
  };

  // 4. Placeholders match success
  logs.push({
    timestamp,
    step: 'GDI_PLACEHOLDERS_READY',
    status: 'success',
    message: 'Balanceamento de Placeholders para substituição concluído',
    details: `Todos os marcantes {{ PLACEHOLDERS }} vinculados ao template mestre estão prontos`
  });

  const normalized: NormalizedGdiData = {
    documentType,
    caseId,
    clientId,
    clientType: clientType as 'PF' | 'PJ',
    destinationFolderId,
    destinationFolderUrl,
    pf: pfDataNormalized,
    pj: pjDataNormalized,
    representante: socioDataNormalized,
    bancario: bancarioDataNormalized,
    acesso: acessoDataNormalized,
    caso: casoData,
    escritorio: escritorioData
  };

  return {
    normalized,
    logs,
    validation: {
      isValid: true,
      missingMandatory: [],
      absentFields
    }
  };
}

/**
 * Creates a normalized payload setup helper failure response
 */
function createFailureResult(
  errorType: string,
  message: string,
  logs: GdiLogEntry[],
  missingMandatory: string[] = [],
  absentFields: string[] = []
): {
  normalized: NormalizedGdiData;
  logs: GdiLogEntry[];
  validation: {
    isValid: boolean;
    missingMandatory: string[];
    absentFields: string[];
    errorType: string;
    errorMessage: string;
  };
} {
  const timestamp = getFormattedNow();

  // Log GDI Failure codes matching requirement specs
  logs.push({
    timestamp,
    step: getFailStep(errorType),
    status: 'failed',
    message,
    details: `ID do Erro: ${errorType}`
  });

  const emptyDoc: NormalizedGdiData = {
    documentType: '',
    caseId: '',
    clientId: '',
    clientType: 'PF',
    destinationFolderId: '',
    destinationFolderUrl: '',
    pf: {},
    pj: {},
    representante: {},
    bancario: {},
    acesso: {},
    caso: {},
    escritorio: {}
  };

  return {
    normalized: emptyDoc,
    logs,
    validation: {
      isValid: false,
      missingMandatory,
      absentFields,
      errorType,
      errorMessage: message
    }
  };
}

function getFailStep(errorType: string): string {
  if (errorType === 'PAYLOAD_EMPTY') return 'GDI_PAYLOAD_EMPTY';
  if (errorType === 'CLIENT_TYPE_MISSING') return 'GDI_CLIENT_TYPE_MISSING';
  if (errorType === 'CLIENT_DATA_MISSING') return 'GDI_CLIENT_DATA_MISSING';
  if (errorType === 'GDI_PF_REQUIRED_FIELD_MISSING') return 'GDI_PF_REQUIRED_FIELD_MISSING';
  if (errorType === 'GDI_PJ_REQUIRED_FIELD_MISSING') return 'GDI_PJ_REQUIRED_FIELD_MISSING';
  if (errorType === 'GDI_SOCIO_REQUIRED_FIELD_MISSING') return 'GDI_SOCIO_REQUIRED_FIELD_MISSING';
  return 'GDI_VAL_FAILED';
}

/**
 * Compiles a rich set of placeholder values matched specifically with the
 * template parameters defined by GDI guidelines.
 */
export function getPlaceholdersForDoc(
  documentType: string,
  normal: NormalizedGdiData
): Record<string, string> {
  const pf = normal.pf;
  const pj = normal.pj;
  const rep = normal.representante;
  const b = normal.bancario;
  const c = normal.caso;
  const esc = normal.escritorio;

  // Base Map for all documents pulling from same normalizer layer
  const map: Record<string, string> = {
    // Escopo Escritório e Assinatura
    '{{LOCAL_ASSINATURA}}': esc.localAssinatura || '',
    '{{DATA_ASSINATURA}}': esc.dataAssinatura || '',
    '{{ADVOGADO_NOME}}': esc.advogadoNome || '',
    '{{ADVOGADO_OAB}}': esc.advogadoOab || '',

    // Escopo Caso
    '{{NATUREZA_ACAO}}': c.naturezaAcao || '',
    '{{VALOR_HONORARIOS}}': c.valorHonorarios || '',
    '{{FORMA_PAGAMENTO}}': c.formaPagamento || '',
    '{{VARA_COMPETENTE}}': c.varaCompetente || '',
    '{{FORO_COMARCA}}': c.foroComarca || '',
    '{{RELATO_FATOS}}': c.relatoFatos || '',
    '{{VALOR_CAUSA_ESTIMADO}}': c.valorCausa || '',
    '{{REREPRESENTACAO_VARA}}': c.varaCompetente || '', // fallback placeholder variant
  };

  // Incorporate PF Placeholders
  if (normal.clientType === 'PF') {
    map['{{OUTORGANTE_NOME}}'] = pf.pf_nomeCompleto || '';
    map['{{OUTORGANTE_NACIONALIDADE}}'] = pf.pf_nacionalidade || '';
    map['{{OUTORGANTE_ESTADO_CIVIL}}'] = pf.pf_estadoCivil || '';
    map['{{OUTORGANTE_PROFISSAO}}'] = pf.pf_profissao || '';
    map['{{OUTORGANTE_CPF}}'] = pf.pf_cpf || '';
    map['{{OUTORGANTE_RG}}'] = pf.pf_rg || '';
    map['{{OUTORGANTE_ORGAO_EMISSOR}}'] = pf.pf_orgaoEmissor || '';
    map['{{OUTORGANTE_ENDERECO}}'] = pf.pf_endereco || '';
    map['{{OUTORGANTE_NUMERO}}'] = pf.pf_numero || '';
    map['{{OUTORGANTE_COMPLEMENTO}}'] = pf.pf_complemento || '';
    map['{{OUTORGANTE_BAIRRO}}'] = pf.pf_bairro || '';
    map['{{OUTORGANTE_CIDADE}}'] = pf.pf_cidade || '';
    map['{{OUTORGANTE_ESTADO}}'] = pf.pf_estado || '';
    map['{{OUTORGANTE_CEP}}'] = pf.pf_cep || '';
    map['{{OUTORGANTE_EMAIL}}'] = pf.pf_email || '';
    map['{{OUTORGANTE_TELEFONE}}'] = pf.pf_telefone || '';
    map['{{OUTORGANTE_WHATSAPP}}'] = pf.pf_whatsapp || '';

    // Declaração PF support
    map['{{DECLARANTE_NOME}}'] = pf.pf_nomeCompleto || '';
    map['{{DECLARANTE_CPF}}'] = pf.pf_cpf || '';
    map['{{DECLARANTE_RG}}'] = pf.pf_rg || '';
    map['{{DECLARANTE_PROFISSAO}}'] = pf.pf_profissao || '';

    // Contrato PF support
    map['{{CONTRATANTE_NOME}}'] = pf.pf_nomeCompleto || '';
    map['{{CONTRATANTE_CPF}}'] = pf.pf_cpf || '';

    // 1º Atendimento PF support
    map['{{CLIENTE_NOME}}'] = pf.pf_nomeCompleto || '';
    map['{{CLIENTE_TELEFONE}}'] = pf.pf_telefone || '';
  }

  // Incorporate PJ Placeholders
  if (normal.clientType === 'PJ') {
    map['{{EMPRESA_RAZAO_SOCIAL}}'] = pj.pj_razaoSocial || '';
    map['{{EMPRESA_NOME_FANTASIA}}'] = pj.pj_nomeFantasia || '';
    map['{{EMPRESA_CNPJ}}'] = pj.pj_cnpj || '';
    map['{{EMPRESA_INSCRICAO_ESTADUAL}}'] = pj.pj_inscricaoEstadual || '';
    map['{{EMPRESA_INSCRICAO_MUNICIPAL}}'] = pj.pj_inscricaoMunicipal || '';
    map['{{EMPRESA_ENDERECO}}'] = pj.pj_enderecoEmpresa || '';
    map['{{EMPRESA_NUMERO}}'] = pj.pj_numeroEmpresa || '';
    map['{{EMPRESA_COMPLEMENTO}}'] = pj.pj_complementoEmpresa || '';
    map['{{EMPRESA_BAIRRO}}'] = pj.pj_bairroEmpresa || '';
    map['{{EMPRESA_CIDADE}}'] = pj.pj_cidadeEmpresa || '';
    map['{{EMPRESA_ESTADO}}'] = pj.pj_estadoEmpresa || '';
    map['{{EMPRESA_CEP}}'] = pj.pj_cepEmpresa || '';
    map['{{EMPRESA_EMAIL}}'] = pj.pj_emailEmpresa || '';
    map['{{EMPRESA_TELEFONE}}'] = pj.pj_telefoneEmpresa || '';
    map['{{EMPRESA_WHATSAPP}}'] = pj.pj_whatsappEmpresa || '';

    // Representante
    map['{{REPRESENTANTE_NOME}}'] = rep.socio_nomeCompleto || '';
    map['{{REPRESENTANTE_NACIONALIDADE}}'] = rep.socio_nacionalidade || '';
    map['{{REPRESENTANTE_ESTADO_CIVIL}}'] = rep.socio_estadoCivil || '';
    map['{{REPRESENTANTE_PROFISSAO}}'] = rep.socio_profissao || '';
    map['{{REPRESENTANTE_CPF}}'] = rep.socio_cpf || '';
    map['{{REPRESENTANTE_RG}}'] = rep.socio_rg || '';
    map['{{REPRESENTANTE_ORGAO_EMISSOR}}'] = rep.socio_orgaoEmissor || '';
    map['{{REPRESENTANTE_ENDERECO}}'] = rep.socio_endereco || '';
    map['{{REPRESENTANTE_NUMERO}}'] = rep.socio_numero || '';
    map['{{REPRESENTANTE_COMPLEMENTO}}'] = rep.socio_complemento || '';
    map['{{REPRESENTANTE_BAIRRO}}'] = rep.socio_bairro || '';
    map['{{REPRESENTANTE_CIDADE}}'] = rep.socio_cidade || '';
    map['{{REPRESENTANTE_ESTADO}}'] = rep.socio_estado || '';
    map['{{REPRESENTANTE_CEP}}'] = rep.socio_cep || '';

    // Contrato PJ / Declaração PJ support
    map['{{EMPRESA_CONTRATANTE}}'] = pj.pj_razaoSocial || '';
    map['{{REPRESENTACAO_VARA}}'] = c.varaCompetente || '';
    map['{{FORO_COMARCA}}'] = c.foroComarca || '';
  }

  // Bancários (shared)
  map['{{PIX_TIPO_CHAVE}}'] = b.bancario_tipoChavePix || '';
  map['{{PIX_CHAVE}}'] = b.bancario_chavePix || '';
  map['{{PIX_BANCO}}'] = b.bancario_bancoPix || '';
  map['{{PIX_TITULAR}}'] = b.bancario_titularPix || '';
  map['{{BANCO_NOME}}'] = b.bancario_banco || '';
  map['{{BANCO_AGENCIA}}'] = b.bancario_agencia || '';
  map['{{BANCO_CONTA}}'] = b.bancario_numeroConta || '';
  map['{{BANCO_OPERACAO}}'] = b.bancario_operacao || '';

  return map;
}

/**
 * Returns GDI default template payloads corresponding to the selected document type.
 * Loaded dynamically in GDI config map diagnostics.
 */
export function getTechnicalPayloadForDoc(
  docType: string,
  clientType: 'PF' | 'PJ'
): PortalBossPayload {
  if (clientType === 'PF') {
    return {
      documentType: docType,
      caseId: '',
      clientId: '',
      clientType: 'PF',
      source: 'Portal BOSS Clientes',
      target: 'GDI',
      destinationFolderId: '',
      destinationFolderUrl: '',
      clientRawData: {
        pfData: {
          pf_nomeCompleto: '',
          pf_cpf: '',
          pf_rg: '',
          pf_orgaoEmissor: '',
          pf_dataEmissao: '',
          pf_nascimento: '',
          pf_nacionalidade: '',
          pf_estadoCivil: '',
          pf_profissao: '',
          pf_telefone: '',
          pf_whatsapp: '',
          pf_email: '',
          pf_cep: '',
          pf_endereco: '',
          pf_numero: '',
          pf_complemento: '',
          pf_bairro: '',
          pf_cidade: '',
          pf_estado: ''
        },
        bancarioDadosBancarios: {
          bancario_possuiDadosBancarios: false,
          bancario_tipoChavePix: '',
          bancario_chavePix: '',
          bancario_bancoPix: '',
          bancario_titularPix: '',
          bancario_titularEhCliente: false,
          bancario_banco: '',
          bancario_agencia: '',
          bancario_numeroConta: '',
          bancario_operacao: ''
        },
        acessoSistema: {
          acesso_emailLogin: '',
          acesso_statusAcesso: '',
          acesso_senha: ''
        }
      },
      caseData: {
        naturezaAcao: '',
        valorHonorarios: '',
        formaPagamento: '',
        varaCompetente: '',
        foroComarca: '',
        relatoFatos: ''
      },
      officeData: {
        localAssinatura: '',
        advogadoNome: '',
        advogadoOab: '',
        dataAssinatura: ''
      }
    };
  } else {
    return {
      documentType: docType,
      caseId: '',
      clientId: '',
      clientType: 'PJ',
      source: 'Portal BOSS Clientes',
      target: 'GDI',
      destinationFolderId: '',
      destinationFolderUrl: '',
      clientRawData: {
        pjDadosEmpresa: {
          pj_razaoSocial: '',
          pj_nomeFantasia: '',
          pj_cnpj: '',
          pj_inscricaoEstadual: '',
          pj_inscricaoMunicipal: '',
          pj_emailEmpresa: '',
          pj_telefoneEmpresa: '',
          pj_whatsappEmpresa: '',
          pj_cepEmpresa: '',
          pj_enderecoEmpresa: '',
          pj_numeroEmpresa: '',
          pj_complementoEmpresa: '',
          pj_bairroEmpresa: '',
          pj_cidadeEmpresa: '',
          pj_estadoEmpresa: ''
        },
        socioDadosPessoais: {
          socio_nomeCompleto: '',
          socio_cpf: '',
          socio_rg: '',
          socio_orgaoEmissor: '',
          socio_dataEmissao: '',
          socio_nascimento: '',
          socio_nacionalidade: '',
          socio_estadoCivil: '',
          socio_profissao: '',
          socio_telefone: '',
          socio_whatsapp: '',
          socio_email: '',
          socio_cep: '',
          socio_endereco: '',
          socio_numero: '',
          socio_complemento: '',
          socio_bairro: '',
          socio_cidade: '',
          socio_estado: ''
        },
        bancarioData: {
          bancario_possuiDadosBancarios: false,
          bancario_tipoChavePix: '',
          bancario_chavePix: '',
          bancario_bancoPix: '',
          bancario_titularPix: ''
        }
      },
      caseData: {
        naturezaAcao: '',
        valorHonorarios: '',
        formaPagamento: '',
        varaCompetente: '',
        relatoFatos: ''
      },
      officeData: {
        localAssinatura: '',
        advogadoNome: '',
        advogadoOab: '',
        dataAssinatura: ''
      }
    };
  }
}
