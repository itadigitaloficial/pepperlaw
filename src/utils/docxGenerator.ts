import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { ContractData } from '../types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generateContractDocument = async (contractData: ContractData) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: contractData.title.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          alignment: 'center',
          spacing: {
            after: 400,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${contractData.parties.firstParty.name}, `,
              bold: true,
            }),
            new TextRun(`portador(a) do documento ${contractData.parties.firstParty.document}, residente em ${contractData.parties.firstParty.address}, doravante denominado(a) CONTRATANTE, e `),
            new TextRun({
              text: `${contractData.parties.secondParty.name}, `,
              bold: true,
            }),
            new TextRun(`portador(a) do documento ${contractData.parties.secondParty.document}, residente em ${contractData.parties.secondParty.address}, doravante denominado(a) CONTRATADO(A),`),
          ],
          spacing: {
            after: 200,
          },
        }),
        ...contractData.clauses.map(clause => [
          new Paragraph({
            text: clause.title,
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new Paragraph({
            text: clause.content,
            spacing: {
              after: 200,
            },
          }),
        ]).flat(),
        new Paragraph({
          text: `${format(new Date(contractData.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
          alignment: 'center',
          spacing: {
            before: 800,
            after: 400,
          },
        }),
        new Paragraph({
          text: '_'.repeat(50),
          alignment: 'center',
          spacing: {
            before: 400,
          },
        }),
        new Paragraph({
          text: contractData.parties.firstParty.name,
          alignment: 'center',
        }),
        new Paragraph({
          text: '_'.repeat(50),
          alignment: 'center',
          spacing: {
            before: 400,
          },
        }),
        new Paragraph({
          text: contractData.parties.secondParty.name,
          alignment: 'center',
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${contractData.title.toLowerCase().replace(/\s+/g, '-')}.docx`);
};