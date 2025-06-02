import React from 'react';
import { Box, Heading, Text, VStack, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react';
import { usePriceQuoteStore } from '../../stores/usePriceQuoteStore';

// Example type - replace with generated GraphQL types
// interface InvoiceEntry { // This can be removed if PriceQuoteGQL from store provides typed invoice_schedule_entries
//   id?: string;
//   entry_type: string;
//   due_date: string; // or Date
//   amount_due: number;
//   description?: string;
// }

const InvoiceScheduleDisplay: React.FC = () => {
  const { currentQuotePreview } = usePriceQuoteStore();
  const invoiceSchedule = currentQuotePreview?.invoice_schedule_entries || []; // Assuming structure
  // const invoiceSchedule: InvoiceEntry[] = []; // Placeholder

  if (!currentQuotePreview) {
    return <Text>No quote preview available to display schedule.</Text>;
  }

  if (!invoiceSchedule || invoiceSchedule.length === 0) {
    return (
        <Box p={4} borderWidth="1px" borderRadius="md" mt={4}>
            <Heading size="md" mb={3}>Generated Invoice Schedule</Heading>
            <Text>Invoice schedule has not been generated or is empty.</Text>
        </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mt={4}>
      <Heading size="md" mb={3}>Generated Invoice Schedule</Heading>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Due Date</Th>
              <Th isNumeric>Amount Due</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {invoiceSchedule.map((entry, index) => (
              <Tr key={entry.id || index}>
                <Td>{entry.entry_type}</Td>
                <Td>{new Date(entry.due_date).toLocaleDateString()}</Td>
                <Td isNumeric>{entry.amount_due.toFixed(2)}</Td>
                <Td>{entry.description || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InvoiceScheduleDisplay; 