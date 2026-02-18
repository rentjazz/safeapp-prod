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
  CircularProgress
} from '@mui/material';
import {
  Mic,
  Stop,
  CameraAlt,
  Delete,
  Close,
  Send
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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // Upload photos
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, { preview: reader.result, file }]);
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
        const blob = new Blob(chunks, { type: 'audio/wav' });
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

  // Envoi email
  const sendEmail = async () => {
    if (!marque || !modele) {
      alert('Veuillez renseigner la marque et le modèle');
      return;
    }

    setSending(true);
    
    try {
      // Préparer le contenu HTML de l'email
      const photosHtml = photos.map((p, i) => `<p>Photo ${i+1}: ${p.preview.substring(0,50)}...</p>`).join('');
      
      const htmlContent = `
        <h2>🎯 Prise de Côte - ${marque} ${modele}</h2>
        <h3>📏 Cotes:</h3>
        <pre style="background:#f0f0f0;padding:10px">${cotes || 'Aucune'}</pre>
        <h3>📝 Notes:</h3>
        <p>${notes || 'Aucune'}</p>
        <h3>📸 Photos (${photos.length}):</h3>
        ${photosHtml || '<p>Aucune photo</p>'}
        <h3>🎤 Audio:</h3>
        <p>${audioBlob ? 'Audio joint ci-dessus' : 'Aucun audio'}</p>
      `;

      const ficheData = {
        marque,
        modele,
        photos: photos.map(p => p.preview),
        cotes,
        notes,
        date: new Date().toISOString()
      };

      await fetch('https://n8n.superprojetx.com/webhook/safeapp-send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'contact@safehdf.com',
          subject: `📋 Prise de Côte - ${marque} ${modele}`,
          html: htmlContent,
          fiche: ficheData
        })
      });

      setSent(true);
      // Reset après 3 secondes
      setTimeout(() => {
        setMarque('');
        setModele('');
        setPhotos([]);
        setCotes('');
        setNotes('');
        setAudioBlob(null);
        setSent(false);
      }, 3000);
      
    } catch (err) {
      alert('Erreur envoi: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', p: 3, textAlign: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: COLORS.success, color: '#fff', fontSize: '1.2em' }}>
          ✅ Email envoyé à contact@safehdf.com !
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
            label="Marque"
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            sx={{ mb: 2, '& .MuiInputBase-root': { bgcolor: COLORS.card }, '& .MuiInputBase-input': { color: COLORS.text } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Modèle"
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
                        sx={{ position: 'absolute', top: 2, right: 2, bgcolor: COLORS.error, color: '#fff' }}
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

        {/* Bouton Envoyer */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={sending ? <CircularProgress size={20} /> : <Send />}
            onClick={sendEmail}
            disabled={sending}
            sx={{ bgcolor: COLORS.success, py: 2, '&:hover': { bgcolor: '#388e3c' } }}
          >
            {sending ? 'Envoi en cours...' : 'Envoyer par email'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PriseDeCote;
