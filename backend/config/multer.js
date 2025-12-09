const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '..', 'uploads', 'fotos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Criar diretório de uploads de anexos do help desk
const helpDeskUploadsDir = path.join(__dirname, '..', 'uploads', 'help-desk');
if (!fs.existsSync(helpDeskUploadsDir)) {
  fs.mkdirSync(helpDeskUploadsDir, { recursive: true });
}

// Criar diretório de uploads de imagens de serviços
const servicosUploadsDir = path.join(__dirname, '..', 'uploads', 'servicos');
if (!fs.existsSync(servicosUploadsDir)) {
  fs.mkdirSync(servicosUploadsDir, { recursive: true });
}

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único: timestamp + random + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `foto-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Configuração do Multer para upload de anexos do Help Desk (imagens e PDFs)
const helpDeskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, helpDeskUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `anexo-${uniqueSuffix}${ext}`);
  },
});

const helpDeskFileFilter = (req, file, cb) => {
  // Aceitar imagens e PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem e PDF são permitidos!'), false);
  }
};

const uploadHelpDesk = multer({
  storage: helpDeskStorage,
  fileFilter: helpDeskFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Configuração do Multer para upload de imagens de serviços (máximo 3)
const servicosStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, servicosUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `servico-${uniqueSuffix}${ext}`);
  },
});

const servicosFileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const uploadServicos = multer({
  storage: servicosStorage,
  fileFilter: servicosFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por imagem
  },
});

module.exports = {
  upload,
  uploadHelpDesk,
  uploadServicos,
  uploadsDir,
  helpDeskUploadsDir,
  servicosUploadsDir,
};

// Exportar também individualmente para compatibilidade
module.exports.uploadsDir = uploadsDir;
module.exports.helpDeskUploadsDir = helpDeskUploadsDir;
module.exports.servicosUploadsDir = servicosUploadsDir;

