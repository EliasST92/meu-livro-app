import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const esc = (value: string) =>
  String(value ?? '')
    .replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] ?? char));

const contentToHtml = (text: string) => {
  // Split by images and paragraphs
  const parts = text.split(/(\[IMAGEM:\s*https?:\/\/[^\]]+\])/);
  return parts
    .map((part) => {
      const imgMatch = part.match(/\[IMAGEM:\s*(https?:\/\/[^\]]+)\]/);
      if (imgMatch) {
        return `<div class="img-wrap"><img src="${esc(imgMatch[1])}" /></div>`;
      }
      return part
        .split('\n\n')
        .filter((p) => p.trim())
        .map((p) => `<p>${esc(p).replace(/\n/g, '<br/>')}</p>`)
        .join('');
    })
    .join('');
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const book = await prisma.book.findFirst({
      where: { id: String(body?.bookId ?? ''), userId: session.user.id },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });

    // Build cover image URL if available
    let coverImageUrl = '';
    if (book?.coverStoragePath && book?.coverIsPublic) {
      const { getFileUrl } = await import('@/lib/s3');
      coverImageUrl = await getFileUrl(book.coverStoragePath, book.coverContentType ?? 'image/jpeg', true);
    }
    if (!book)
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    const premium = session.user.isPremium;
    const requested = String(body?.format ?? 'A5');
    const format = premium && ['A4', 'A5', '14x21'].includes(requested) ? requested : 'A5';
    const authorName = esc(session.user.name ?? 'Autor');
    const bookTitle = esc(book.title);
    const genre = esc(book.genre ?? '');

    // Cover page
    const cover = coverImageUrl
      ? `<section class="cover cover-image"><img src="${esc(coverImageUrl)}" class="cover-img" /><h1 class="cover-overlay-title">${bookTitle}</h1><p class="cover-overlay-author">${authorName}</p></section>`
      : `<section class="cover"><div class="cover-line"></div><h1>${bookTitle}</h1>${genre ? `<p class="genre">${genre}</p>` : ''}<div class="cover-separator"></div><p class="author">${authorName}</p></section>`;

    // Dedication/credits page
    const credits = `
      <section class="credits">
        <p class="credits-title">${bookTitle}</p>
        <p class="credits-author">${authorName}</p>
        ${genre ? `<p class="credits-genre">${genre}</p>` : ''}
      </section>`;

    // Table of contents
    const toc = `
      <section class="toc">
        <h1>Sumário</h1>
        ${book.chapters.map((c, i) => `<p class="toc-entry"><span class="toc-num">${i + 1}</span><span class="toc-title">${esc(c.title)}</span></p>`).join('')}
      </section>`;

    // Chapters
    const chapters = book.chapters
      .map(
        (chapter, index) => `
      <section class="chapter">
        <div class="chapter-header">
          <p class="chapter-num">Capítulo ${index + 1}</p>
          <h1>${esc(chapter.title)}</h1>
          <div class="chapter-ornament">✶</div>
        </div>
        <div class="chapter-body">
          ${contentToHtml(chapter.content)}
        </div>
      </section>`
      )
      .join('');

    // End page
    const endPage = `
      <section class="endpage">
        <p class="end-symbol">✶</p>
        <p class="end-text">FIM</p>
      </section>`;

    const watermark = premium
      ? ''
      : '<div class="watermark">Criado com Meu Livro · meulivro.abacusai.app</div>';

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"></head><body>${cover}${credits}${toc}${chapters}${endPage}${watermark}</body></html>`;

    const css = `
      @page {
        margin: ${format === 'A4' ? '25mm 20mm 30mm' : '18mm 15mm 22mm'};
        @bottom-center {
          content: counter(page);
          font: 8pt Georgia, serif;
          color: #999;
        }
      }
      body {
        font-family: Georgia, 'Palatino Linotype', serif;
        color: #1a1a1a;
        font-size: ${format === 'A4' ? '11.5pt' : '10.5pt'};
        line-height: 1.8;
      }

      /* CAPA COM IMAGEM */
      .cover-image {
        height: 100vh;
        position: relative;
        overflow: hidden;
        page-break-after: always;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: 60px;
      }
      .cover-img {
        position: absolute;
        top: 0;
        left: -20mm;
        right: -20mm;
        width: calc(100% + 40mm);
        height: 100%;
        object-fit: cover;
      }
      .cover-overlay-title {
        position: relative;
        z-index: 2;
        color: white;
        text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        font-size: 28pt;
        text-align: center;
        max-width: 85%;
      }
      .cover-overlay-author {
        position: relative;
        z-index: 2;
        color: rgba(255,255,255,0.9);
        font-size: 13pt;
        margin-top: 10px;
        text-shadow: 0 1px 6px rgba(0,0,0,0.5);
      }

      /* CAPA SEM IMAGEM */
      .cover {
        height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        page-break-after: always;
      }
      .cover-line {
        width: 60px;
        height: 3px;
        background: #5b21b6;
        margin-bottom: 40px;
      }
      .cover h1 {
        font-size: ${format === 'A4' ? '36pt' : '28pt'};
        max-width: 85%;
        line-height: 1.2;
        color: #1a1a1a;
      }
      .cover .genre {
        font-size: 10pt;
        text-transform: uppercase;
        letter-spacing: 4px;
        color: #5b21b6;
        margin-top: 15px;
      }
      .cover-separator {
        width: 40px;
        height: 1px;
        background: #ccc;
        margin: 30px 0;
      }
      .cover .author {
        font-size: 13pt;
        color: #666;
        letter-spacing: 2px;
      }

      /* CRÉDITOS */
      .credits {
        height: 85vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        page-break-after: always;
      }
      .credits-title { font-size: 16pt; font-weight: bold; }
      .credits-author { font-size: 12pt; color: #666; margin-top: 10px; }
      .credits-genre { font-size: 9pt; color: #999; margin-top: 8px; text-transform: uppercase; letter-spacing: 3px; }

      /* SUMÁRIO */
      .toc {
        page-break-after: always;
        padding-top: 60px;
      }
      .toc h1 {
        font-size: 20pt;
        text-align: center;
        margin-bottom: 40px;
        color: #1a1a1a;
      }
      .toc-entry {
        display: flex;
        align-items: baseline;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px dotted #ddd;
        font-size: 10.5pt;
      }
      .toc-num {
        font-weight: bold;
        color: #5b21b6;
        min-width: 20px;
      }

      /* CAPÍTULOS */
      .chapter {
        page-break-before: always;
      }
      .chapter-header {
        text-align: center;
        padding-top: 80px;
        padding-bottom: 40px;
      }
      .chapter-num {
        text-transform: uppercase;
        letter-spacing: 4px;
        font-size: 8pt;
        color: #5b21b6;
        font-family: Arial, sans-serif;
      }
      .chapter h1 {
        font-size: ${format === 'A4' ? '24pt' : '20pt'};
        margin: 10px 0 0;
        color: #1a1a1a;
      }
      .chapter-ornament {
        margin-top: 20px;
        font-size: 10pt;
        color: #ccc;
      }
      .chapter-body {
        text-align: justify;
      }
      .chapter-body p {
        text-indent: 1.5em;
        margin: 0;
      }
      .chapter-body p:first-child {
        text-indent: 0;
      }
      .chapter-body p:first-child::first-letter {
        font-size: 2.5em;
        float: left;
        line-height: 0.85;
        margin-right: 4px;
        font-weight: bold;
        color: #5b21b6;
      }

      /* IMAGENS */
      .img-wrap {
        text-align: center;
        margin: 20px 0;
      }
      .img-wrap img {
        max-width: 80%;
        max-height: 300px;
        object-fit: contain;
      }

      /* PÁGINA FINAL */
      .endpage {
        page-break-before: always;
        height: 85vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .end-symbol { font-size: 18pt; color: #ccc; }
      .end-text { font-size: 12pt; color: #999; letter-spacing: 6px; text-transform: uppercase; margin-top: 15px; }

      /* MARCA D'ÁGUA */
      .watermark {
        position: fixed;
        bottom: 5mm;
        left: 0;
        right: 0;
        text-align: center;
        font: 7pt Arial, sans-serif;
        color: #bbb;
      }
    `;

    const pdfOptions =
      format === '14x21'
        ? {
            width: '140mm',
            height: '210mm',
            print_background: true,
            display_header_footer: true,
            footer_template:
              '<div style="width:100%;font-size:8px;text-align:center;color:#999"><span class="pageNumber"></span></div>',
            header_template: '<div></div>',
          }
        : {
            format,
            print_background: true,
            display_header_footer: true,
            footer_template:
              '<div style="width:100%;font-size:8px;text-align:center;color:#999"><span class="pageNumber"></span></div>',
            header_template: '<div></div>',
          };

    const response = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html,
        pdf_options: pdfOptions,
        css_stylesheet: css,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.request_id)
      return NextResponse.json({ error: 'O serviço de PDF não aceitou a solicitação.' }, { status: 502 });

    return NextResponse.json({ requestId: result.request_id });
  } catch (error) {
    console.error('Erro ao criar PDF', error);
    return NextResponse.json({ error: 'Não foi possível iniciar a exportação.' }, { status: 500 });
  }
}