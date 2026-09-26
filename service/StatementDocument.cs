using NovaPay.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace NovaPay.Services;

public class StatementDocument : IDocument
{
    private readonly StatementReportModel _model;

    public StatementDocument(StatementReportModel model)
    {
        _model = model;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Margin(35);
            page.Size(PageSizes.A4);
            page.PageColor(Colors.White);
            page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Grey.Darken3));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().Element(ComposeFooter);
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                // Left: Company Branding
                row.RelativeItem().Column(brand =>
                {
                    brand.Item().Text("NovaPay").FontSize(22).Bold().FontColor(Colors.Blue.Darken3);
                    brand.Item().Text("Digital Wallet & Ledger Engine").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                // Right: Document Title & Generation Date
                row.RelativeItem().AlignRight().Column(details =>
                {
                    details.Item().Text("ACCOUNT STATEMENT").FontSize(14).Bold().FontColor(Colors.Grey.Darken4);
                    details.Item().Text($"Generated: {_model.GeneratedAt:yyyy-MM-dd HH:mm} UTC");
                    details.Item().Text($"Period: {_model.StartDate:yyyy-MM-dd} to {_model.EndDate:yyyy-MM-dd}");
                });
            });

            col.Item().PaddingTop(15).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            // Account & Customer Details
            col.Item().PaddingTop(10).Row(row =>
            {
                row.RelativeItem().Column(cust =>
                {
                    cust.Item().Text("ACCOUNT HOLDER").FontSize(8).Bold().FontColor(Colors.Grey.Medium);
                    cust.Item().Text(_model.CustomerName).Bold().FontSize(11);
                    cust.Item().Text(_model.CustomerEmail);
                });

                row.RelativeItem().AlignRight().Column(acc =>
                {
                    acc.Item().Text("ACCOUNT NUMBER").FontSize(8).Bold().FontColor(Colors.Grey.Medium);
                    acc.Item().Text(_model.AccountNumber).Bold().FontSize(11);
                    acc.Item().Text($"Currency: {_model.Currency}");
                });
            });

            col.Item().PaddingTop(15).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingVertical(15).Column(col =>
        {
            // 1. Summary Cards Row
            col.Item().Row(row =>
            {
                row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(c =>
                {
                    c.Item().Text("Opening Balance").FontSize(8).FontColor(Colors.Grey.Medium);
                    c.Item().Text($"${_model.OpeningBalance:N2}").Bold().FontSize(11);
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(c =>
                {
                    c.Item().Text("Total Inflow (Credits)").FontSize(8).FontColor(Colors.Grey.Medium);
                    c.Item().Text($"${_model.TotalDeposits:N2}").Bold().FontSize(11).FontColor(Colors.Green.Darken2);
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(c =>
                {
                    c.Item().Text("Total Outflow (Debits)").FontSize(8).FontColor(Colors.Grey.Medium);
                    c.Item().Text($"${_model.TotalWithdrawals:N2}").Bold().FontSize(11).FontColor(Colors.Red.Darken2);
                });

                row.ConstantItem(10);

                row.RelativeItem().Border(1).BorderColor(Colors.Blue.Darken2).Background(Colors.Blue.Lighten5).Padding(8).Column(c =>
                {
                    c.Item().Text("Closing Balance").FontSize(8).Bold().FontColor(Colors.Blue.Darken3);
                    c.Item().Text($"${_model.ClosingBalance:N2}").Bold().FontSize(12).FontColor(Colors.Blue.Darken3);
                });
            });

            col.Item().PaddingTop(20);

            // 2. Transactions Table
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(75);   // Date
                    columns.RelativeColumn(3);     // Reference & Description
                    columns.ConstantColumn(60);   // Type
                    columns.ConstantColumn(75);   // Amount
                    columns.ConstantColumn(80);   // Balance After
                });

                // Table Header
                table.Header(header =>
                {
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Date").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Description / Ref").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Type").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(5).AlignRight().Text("Amount").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3).Padding(5).AlignRight().Text("Balance After").Bold();
                });

                // Table Rows
                foreach (var item in _model.Items)
                {
                    var isCredit = item.Type == "Credit";
                    var amountColor = isCredit ? Colors.Green.Darken2 : Colors.Red.Darken2;
                    var sign = isCredit ? "+" : "-";

                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(5).Text($"{item.Date:yyyy-MM-dd}");
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(5).Column(desc =>
                    {
                        desc.Item().Text(item.Description).Bold();
                        desc.Item().Text(item.ReferenceId).FontSize(7).FontColor(Colors.Grey.Medium);
                    });
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(5).Text(item.Type);
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(5).AlignRight().Text($"{sign}${item.Amount:N2}").Bold().FontColor(amountColor);
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(5).AlignRight().Text($"${item.BalanceAfter:N2}");
                }
            });
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Text("NovaPay Financial Services. This document is system-generated and confidential.")
                .FontSize(7).FontColor(Colors.Grey.Medium);

            row.RelativeItem().AlignRight().Text(text =>
            {
                text.Span("Page ");
                text.CurrentPageNumber();
                text.Span(" of ");
                text.TotalPages();
            });
        });
    }
}