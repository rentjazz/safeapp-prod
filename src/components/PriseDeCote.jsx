import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Mic,
  Stop,
  CameraAlt,
  Close,
  Send,
  ContentCopy
} from '@mui/icons-material';

const COLORS = {
  primary: '#7a1f20',
  background: '#000000',
  card: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  success: '#4caf50'
};

function PriseDeCote() {
  // États du formulaire
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [photos, setPhotos] = useState([]);
  const [cotes, setCotes] = useState('');
  const [notes, setNotes] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  
  // États UI
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMailDialog, setShowMailDialog] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // Upload photos
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, { preview: reader.result, file, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Dictée vocale
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Micro non accessible');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  // Générer le contenu de l'email
  const generateEmailContent = () => {
    const date = new Date().toLocaleString('fr-FR');
    
    let content = `PRISE DE CÔTE - ${marque} ${modele}\n`;
    content += `Date: ${date}\n`;
    content += `============================\n\n`;
    content += `MARQUE: ${marque}\n`;
    content += `MODÈLE: ${modele}\n\n`;
    content += `COTES ET MESURES:\n`;
    content += `${cotes || 'Non renseigné'}\n\n`;
    content += `NOTES COMPLÉMENTAIRES:\n`;
    content += `${notes || 'Aucune'}\n\n`;
    content += `PHOTOS:\n`;
    content += `${photos.length} photo(s) attachée(s)\n\n`;
    
    if (audioBlob) {
      content += `AUDIO:\n`;
      content += `Audio enregistré (${Math.round(audioBlob.size/1024)} KB)\n\n`;
    }
    
    return content;
  };

  // Envoi par email avec mailto:
  const sendEmail = () => {
    if (!marque || !modele) {
      alert('Veuillez renseigner la marque et le modèle');
      return;
    }

    const subject = encodeURIComponent(`📋 Prise de Côte - ${marque} ${modele}`);
    const body = encodeURIComponent(generateEmailContent());
    
    // Ouvrir le client email
    window.location.href = `mailto:contact@safehdf.com?subject=${subject}&body=${body}`;
    
    // Montrer le succès
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reset
      setMarque('');
      setModele('');
      setPhotos([]);
      setCotes('');
      setNotes('');
      setAudioBlob(null);
    }, 5000);
  };

  // Copier dans le presse-papier
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmailContent());
    setShowMailDialog(true);
  };

  if (showSuccess) {
    return (
      <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', p: 3, textAlign: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: COLORS.success, color: '#fff', fontSize: '1.2em', py: 2 }}>
          ✅ Client email ouvert !<br />
          <small>N'oubliez pas d'attacher les photos et l'audio si besoin.</small>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', p: 2 }}>
      <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 'bold', mb: 2 }}>
        🎯 Prise de Côte
      </Typography>

      <Grid container spacing={2}>
        {/* Marque & Modèle */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Marque *"
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            sx={{ mb: 2, '& .MuiInputBase-root': { bgcolor: COLORS.card }, '& .MuiInputBase-input': { color: COLORS.text } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Modèle *"
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            sx={{ mb: 2, '& .MuiInputBase-root': { bgcolor: COLORS.card }, '& .MuiInputBase-input': { color: COLORS.text } }}
          />
        </Grid>

        {/* Photos */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: COLORS.card, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.text, mb: 1 }}>
                📸 Photos ({photos.length})
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CameraAlt />}
                sx={{ bgcolor: COLORS.primary, mb: 1 }}
              >
                Ajouter photos
                <input type="file" hidden multiple accept="image/*" onChange={handlePhotoUpload} />
              </Button>
              {photos.length > 0 && (
                <ImageList cols={4} rowHeight={80}>
                  {photos.map((photo, i) => (
                    <ImageListItem key={i} sx={{ position: 'relative' }}>
                      <img src={photo.preview} style={{ height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                      <IconButton
                        size="small"
                        onClick={() => removePhoto(i)}
                        sx={{ position: 'absolute', top: 2, right: 2, bgcolor: '#f44336', color: '#fff' }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Dictée vocale */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: COLORS.card, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.text, mb: 1 }}>
                🎤 Dictée vocale
              </Typography>
              <Button
                variant="contained"
                onClick={isRecording ? stopRecording : startRecording}
                startIcon={isRecording ? <Stop /> : <Mic />}
                sx={{ bgcolor: isRecording ? '#ff4444' : COLORS.primary, mb: 1 }}
              >
                {isRecording ? `Arrêter (${formatTime(recordingTime)})` : 'Enregistrer'}
              </Button>
              {audioBlob && (
                <Typography variant="body2" sx={{ color: COLORS.success }}>
                  ✅ Audio enregistré ({Math.round(audioBlob.size/1024)} KB)
                  <br />
                  <small>L'audio sera à télécharger manuellement</small>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Cotes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cotes et mesures"
            placeholder="Position perçage: ...&#10;Emplacement pênes: ...&#10;Épaisseur porte: ..."
            value={cotes}
            onChange={(e) => setCotes(e.target.value)}
            sx={{ '& .MuiInputBase-root': { bgcolor: COLORS.card }, '& .MuiInputBase-input': { color: COLORS.text, fontFamily: 'monospace' } }}
          />
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes complémentaires"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ '& .MuiInputBase-root': { bgcolor: COLORS.card }, '& .MuiInputBase-input': { color: COLORS.text } }}
          />
        </Grid>

        {/* Boutons */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Send />}
            onClick={sendEmail}
            sx={{ bgcolor: COLORS.success, py: 2, mb: 2, '&:hover': { bgcolor: '#388e3c' } }}
          >
            Ouvrir mon client email
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<ContentCopy />}
            onClick={copyToClipboard}
            sx={{ color: COLORS.text, borderColor: COLORS.textSecondary }}
          >
            Copier le texte dans le presse-papier
          </Button>
        </Grid>
      </Grid>

      {/* Dialog mailto info */}
      <Dialog open={showMailDialog} onClose={() => setShowMailDialog(false)}>
        <DialogTitle>Texte copié !</DialogTitle>
        <DialogContent>
          <Typography>Le texte est copié dans votre presse-papier.</Typography>
          <Typography sx={{ mt: 1 }}><strong>Email :</strong> contact@safehdf.com</Typography>
          <Typography sx={{ mt: 1 }}><strong>Sujet :</strong> Prise de Côte - {marque} {modele}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMailDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PriseDeCote;
