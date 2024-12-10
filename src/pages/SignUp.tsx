import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Alert,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

const steps = ['Informações Básicas', 'Dados Profissionais', 'Confirmação'];

export const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dados básicos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Dados profissionais
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const handleNext = () => {
    if (activeStep === 0) {
      if (!email || !password || !confirmPassword || !name) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
    }

    if (activeStep === 1) {
      if (!company || !role || !phone) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
    }

    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      const userData = {
        name,
        company,
        role,
        phone,
      };

      await signUp(email, password, userData);
      navigate('/login', {
        state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' },
      });
    } catch (error) {
      setError('Falha no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <TextField
              required
              fullWidth
              label="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <TextField
              required
              fullWidth
              label="Empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Cargo"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Typography variant="h6" gutterBottom>
              Confirme seus dados
            </Typography>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Nome
                </Typography>
                <Typography>{name}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography>{email}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Empresa
                </Typography>
                <Typography>{company}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Cargo
                </Typography>
                <Typography>{role}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Telefone
                </Typography>
                <Typography>{phone}</Typography>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Paper elevation={3} className="max-w-md w-full space-y-8 p-8">
        <div>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            PepperLaw
          </Typography>
          <Typography component="h2" variant="h5" align="center">
            Criar nova conta
          </Typography>
        </div>

        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <div className="flex justify-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Voltar
            </Button>

            {activeStep === steps.length - 1 ? (
              <LoadingButton
                type="submit"
                variant="contained"
                loading={loading}
                size="large"
              >
                Criar conta
              </LoadingButton>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Próximo
              </Button>
            )}
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            Já tem uma conta? Entre aqui
          </Link>
        </div>
      </Paper>
    </div>
  );
};
