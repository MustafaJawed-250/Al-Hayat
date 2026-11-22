import { Drawer, Box, Typography, IconButton, Button, Divider, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, removeItem, subtotal, deliveryCharge, total } = useCart();
  const navigate = useNavigate();

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontFamily="Playfair Display, serif">Your Cart</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {items.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" mt={4}>Your cart is empty</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => (
              <Box key={item._id} sx={{ display: 'flex', gap: 2 }}>
                {item.image && <Box component="img" src={item.image} alt="" sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }} />}
                <Box flex={1}>
                  <Typography fontWeight={600}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">PKR {item.price}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <IconButton size="small" onClick={() => updateQty(item._id, item.quantity - 1)}><RemoveIcon fontSize="small" /></IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => updateQty(item._id, item.quantity + 1)}><AddIcon fontSize="small" /></IconButton>
                    <Button size="small" color="error" onClick={() => removeItem(item._id)}>Remove</Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
      {items.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography>Subtotal</Typography><Typography>PKR {subtotal}</Typography></Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Delivery</Typography><Typography>PKR {deliveryCharge}</Typography></Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography fontWeight={700}>Total</Typography><Typography fontWeight={700}>PKR {total}</Typography></Box>
          <Button fullWidth variant="contained" color="primary" onClick={() => { onClose(); navigate('/checkout'); }}>
            Checkout
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
