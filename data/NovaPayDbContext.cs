using Microsoft.EntityFrameworkCore;
using NovaPay.Models;
namespace NovaPay.Data;

public class NovaPayDbContext : DbContext
{
      public NovaPayDbContext(DbContextOptions<NovaPayDbContext> options) : base(options){}
      public DbSet<User> Users { get; set; }
      public DbSet<Wallet> Wallets { get; set; }
      public DbSet<Transaction> Transactions { get; set; }
      public DbSet<LedgerEntry> LedgerEntries { get; set; }

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
            base.OnModelCreating(modelBuilder);

            // 1. User Configuration
            modelBuilder.Entity<User>(entity =>
            {
            entity.HasIndex(u => u.Email)
                  .IsUnique();

            entity.Property(u => u.Email)
                  .IsRequired()
                  .HasMaxLength(256);

            entity.Property(u => u.FullName)
                  .IsRequired()
                  .HasMaxLength(100);

            // 1-to-1 relationship with Wallet
            entity.HasOne(u => u.Wallet)
                  .WithOne(w => w.User)
                  .HasForeignKey<Wallet>(w => w.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
            });

            // 2. Wallet Configuration
            modelBuilder.Entity<Wallet>(entity =>
            {
            // Unique Index on AccountNumber
            entity.HasIndex(w => w.AccountNumber)
                  .IsUnique();

            entity.Property(w => w.AccountNumber)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(w => w.Currency)
                  .IsRequired()
                  .HasMaxLength(10);

            // Decimal Precision (18, 4)
            entity.Property(w => w.Balance)
                  .HasPrecision(18, 4);

            // PostgreSQL Concurrency Token (maps to system column xmin)
            entity.Property(w => w.Version)
                  .IsRowVersion();
            });

            // 3. Transaction Configuration
            modelBuilder.Entity<Transaction>(entity =>
            {
            // Unique Index on ReferenceId
            entity.HasIndex(t => t.ReferenceId)
                  .IsUnique();

            entity.Property(t => t.ReferenceId)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(t => t.Amount)
                  .HasPrecision(18, 4);

            entity.Property(t => t.Type)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.Property(t => t.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20);
            });

            // 4. LedgerEntry Configuration (Double-Entry)
            modelBuilder.Entity<LedgerEntry>(entity =>
            {
            // Composite Index for user statement & balance queries
            entity.HasIndex(l => new { l.WalletId, l.CreatedAt });

            // Index for fast transaction lookups
            entity.HasIndex(l => l.TransactionId);

            // Decimal Precision (18, 4)
            entity.Property(l => l.Amount)
                  .HasPrecision(18, 4);

            entity.Property(l => l.Type)
                  .HasConversion<string>()
                  .HasMaxLength(10);

            // Restrict Delete on Wallet (Never delete historical records)
            entity.HasOne(l => l.Wallet)
                  .WithMany(w => w.LedgerEntries)
                  .HasForeignKey(l => l.WalletId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Restrict Delete on Transaction (Never delete historical records)
            entity.HasOne(l => l.Transaction)
                  .WithMany(t => t.LedgerEntries)
                  .HasForeignKey(l => l.TransactionId)
                  .OnDelete(DeleteBehavior.Restrict);
            });
      }
}