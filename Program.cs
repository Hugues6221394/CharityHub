using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.StaticFiles;
using StudentCharityHub.Data;
using StudentCharityHub.Models;
using StudentCharityHub;
using static StudentCharityHub.PermissionCatalogLocal;

using StudentCharityHub.Repositories;
using StudentCharityHub.Services;
using StudentCharityHub.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                       ?? builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;

    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;

    options.Tokens.AuthenticatorTokenProvider = TokenOptions.DefaultAuthenticatorProvider;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "JWT_OR_COOKIE";
    options.DefaultChallengeScheme = "JWT_OR_COOKIE";
})
.AddJwtBearer("Bearer", options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecretKey"]
        ?? throw new InvalidOperationException("JWT SecretKey not configured");

    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
})
.AddCookie("Cookies")
.AddGoogle(options =>
{
    var googleClientId = builder.Configuration["GoogleOAuth:ClientId"];
    var googleClientSecret = builder.Configuration["GoogleOAuth:ClientSecret"];

    if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
    {
        options.ClientId = googleClientId;
        options.ClientSecret = googleClientSecret;
    }
})
.AddPolicyScheme("JWT_OR_COOKIE", "JWT or Cookie", options =>
{
    options.ForwardDefaultSelector = context =>
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader?.StartsWith("Bearer ") == true)
            return "Bearer";
        return "Cookies";
    };
});

// ------------------------
// FIXED: Correct CORS block
// ------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        var allowedOrigins = new List<string>
        {
            "http://localhost:5173",
            "http://localhost:3000",
            "https://charity-hub-frontend.onrender.com"
        };

        var configOrigins = builder.Configuration["AllowedOrigins"];
        if (!string.IsNullOrEmpty(configOrigins))
        {
            allowedOrigins.AddRange(
                configOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries)
            );
        }

        policy.WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Student Charity Hub API",
        Version = "v1",
        Description = "API for Student Charity Hub - connecting donors with students",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Student Charity Hub Team",
            Email = "support@studentcharityhub.com"
        }
    });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// SignalR
builder.Services.AddSignalR();

// Repositories & services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddHttpClient();
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    options.AddPolicy("DonorOnly", p => p.RequireRole("Donor"));
    options.AddPolicy("StudentOnly", p => p.RequireRole("Student"));
    options.AddPolicy("ManagerOnly", p => p.RequireRole("Manager"));
    options.AddPolicy("AdminOrManager", p => p.RequireRole("Admin", "Manager"));

    options.AddPolicy("Permissions.Manage", p => p.RequireClaim("permission", PermissionsManagement.ManagePermissions));
    options.AddPolicy("Permissions.Audit.View", p => p.RequireClaim("permission", PermissionsManagement.ViewAuditLog));

    options.AddPolicy("Users.View", p => p.RequireClaim("permission", Users.View));
    options.AddPolicy("Users.Manage", p => p.RequireClaim("permission", Users.Manage));

    options.AddPolicy("Students.View", p => p.RequireClaim("permission", Students.View));
    options.AddPolicy("Students.Manage", p => p.RequireClaim("permission", Students.Manage));

    options.AddPolicy("Donations.Create", p => p.RequireClaim("permission", Donations.Create));
    options.AddPolicy("Donations.View", p => p.RequireClaim("permission", Donations.View));
    options.AddPolicy("Donations.Verify", p => p.RequireClaim("permission", Donations.Verify));

    options.AddPolicy("Progress.View", p => p.RequireClaim("permission", Progress.View));
    options.AddPolicy("Progress.Manage", p => p.RequireClaim("permission", Progress.Manage));

    options.AddPolicy("Reports.View", p => p.RequireClaim("permission", Reports.View));
    options.AddPolicy("Reports.Manage", p => p.RequireClaim("permission", Reports.Manage));

    options.AddPolicy("Messages.View", p => p.RequireClaim("permission", Messages.View));
    options.AddPolicy("Messages.Manage", p => p.RequireClaim("permission", Messages.Manage));

    options.AddPolicy("Notifications.View", p => p.RequireClaim("permission", Notifications.View));
    options.AddPolicy("Notifications.Manage", p => p.RequireClaim("permission", Notifications.Manage));
});

var app = builder.Build();

// Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Student Charity Hub API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("ReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<MessageHub>("/hubs/messages");

// Seeder
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        context.Database.EnsureCreated();

        await SeedRolesAsync(roleManager);
        await SeedAdminUserAsync(userManager);
        await SeedPermissionClaimsAsync(userManager, roleManager);
        await EnsureAdminHasAllPermissionsAsync(userManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding.");
    }
}

app.Run();

// ---------------- SEEDERS ----------------

static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
{
    string[] roles = { "Admin", "Donor", "Student", "Manager" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}

static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager)
{
    var adminEmail = "admin@studentcharityhub.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);

    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "Admin",
            LastName = "User",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var result = await userManager.CreateAsync(adminUser, "Admin@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}

static async Task SeedPermissionClaimsAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
{
    const string permissionClaimType = "permission";

    var rolePermissions = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
    {
        ["Admin"] = AllPermissions.ToList(),
        ["Manager"] = new List<string>
        {
            Users.View,
            Students.View, Students.Manage,
            Donations.View, Donations.Verify,
            Progress.View,
            Reports.View,
            Messages.View, Messages.Manage,
            Notifications.View, Notifications.Manage,
        },
        ["Donor"] = new List<string>
        {
            Donations.Create,
            Donations.View,
            Progress.View,
            Notifications.View,
            Messages.View,
        },
        ["Student"] = new List<string>
        {
            Students.View,
            Progress.View, Progress.Manage,
            Messages.View,
            Notifications.View,
        },
    };

    foreach (var kvp in rolePermissions)
    {
        var roleName = kvp.Key;
        var permissions = kvp.Value;

        if (!await roleManager.RoleExistsAsync(roleName))
            continue;

        var usersInRole = await userManager.GetUsersInRoleAsync(roleName);
        foreach (var user in usersInRole)
        {
            var existingClaims = await userManager.GetClaimsAsync(user);
            foreach (var permission in permissions)
            {
                if (!existingClaims.Any(c => c.Type == permissionClaimType && c.Value == permission))
                {
                    await userManager.AddClaimAsync(user,
                        new System.Security.Claims.Claim(permissionClaimType, permission));
                }
            }
        }
    }
}

static async Task EnsureAdminHasAllPermissionsAsync(UserManager<ApplicationUser> userManager)
{
    const string permissionClaimType = "permission";
    var adminEmail = "admin@studentcharityhub.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null) return;

    var existingClaims = await userManager.GetClaimsAsync(adminUser);

    foreach (var permission in AllPermissions)
    {
        if (!existingClaims.Any(c => c.Type == permissionClaimType && c.Value == permission))
        {
            await userManager.AddClaimAsync(adminUser,
                new System.Security.Claims.Claim(permissionClaimType, permission));
        }
    }
}
