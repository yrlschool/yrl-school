import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  MapPin, 
  Send, 
  MessageCircle, 
  Clock,
  ArrowRight,
  QrCode,
  Instagram
} from "lucide-react";
import { toast } from "sonner";
import { APP_NAME, DEVELOPER_NAME } from "@/lib/config";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendToTelegram = async () => {
    const botToken = "8513064823:AAFufYDWgNlqrV0wmoIiGeZZuJZuf_2lPXg";
    const chatId = "7298127855";
    
    const message = `
📩 *رسالة جديدة من ${APP_NAME}*

👤 *الاسم:* ${formData.name}
📧 *البريد:* ${formData.email}
📱 *الهاتف:* ${formData.phone || "غير محدد"}
📝 *الموضوع:* ${formData.subject}

💬 *الرسالة:*
${formData.message}

━━━━━━━━━━━━━━━
🕐 ${new Date().toLocaleString('ar-DZ')}
    `.trim();

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });

    return response.ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const sent = await sendToTelegram();
      
      if (sent) {
        toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error("حدث خطأ في الإرسال، يرجى المحاولة لاحقاً");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("حدث خطأ في الإرسال، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      value: "info.yrlschool@gmail.com",
      link: "mailto:info.yrlschool@gmail.com",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Instagram,
      title: "انستغرام",
      value: "@info.yrlschool",
      link: "https://instagram.com/info.yrlschool",
      color: "from-pink-500 to-purple-500"
    },
    {
      icon: MessageCircle,
      title: "تلغرام",
      value: "تواصل عبر تلغرام",
      link: "https://t.me/info_yrlschool",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: MapPin,
      title: "الموقع",
      value: "الجزائر",
      link: "#",
      color: "from-red-500 to-orange-500"
    }
  ];

  const socialLinks = [
    { icon: Instagram, link: "https://instagram.com/info.yrlschool", label: "Instagram" },
    { icon: Mail, link: "mailto:info.yrlschool@gmail.com", label: "Gmail" }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            تواصل معنا
          </span>
        </h1>
        <p className="text-muted-foreground">
          نحن هنا لمساعدتك! تواصل معنا للاستفسارات أو الدعم الفني
        </p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {contactInfo.map((info, index) => (
          <motion.a
            key={info.title}
            href={info.link}
            target={info.link.startsWith("http") ? "_blank" : undefined}
            rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="block"
          >
            <Card className="h-full border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group cursor-pointer">
              <CardContent className="p-5 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-3`}>
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{info.title}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  {info.value}
                </p>
              </CardContent>
            </Card>
          </motion.a>
        ))}
      </div>

      {/* Contact Form & Info */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border/50">
            <CardHeader id="contact-form">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                أرسل رسالة
              </CardTitle>
              <CardDescription>
                املأ النموذج وسنرد عليك خلال 24 ساعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="رقم الهاتف"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="example@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">الموضوع *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="موضوع الرسالة"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">الرسالة *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="اكتب رسالتك هنا..."
                    rows={5}
                  />
                </div>
                
                <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>جاري الإرسال...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      إرسال الرسالة
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-4">لماذا تتواصل معنا؟</h3>
              <ul className="space-y-3">
                {[
                  "الدعم الفني والمساعدة",
                  "استفسارات عن التطبيق",
                  "اقتراحات وملاحظات",
                  "الإبلاغ عن مشاكل"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">أوقات العمل</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>السبت - الخميس</span>
                  <span className="text-muted-foreground">8:00 ص - 6:00 م</span>
                </div>
                <div className="flex justify-between">
                  <span>الجمعة</span>
                  <span className="text-muted-foreground">مغلق</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">تابعنا على</h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">المطور</p>
            <p className="font-bold text-lg">{DEVELOPER_NAME}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;