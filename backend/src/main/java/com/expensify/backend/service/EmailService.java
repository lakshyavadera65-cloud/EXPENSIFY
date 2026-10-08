package com.expensify.backend.service;
import org.springframework.beans.factory.annotation.Value; import org.springframework.mail.SimpleMailMessage; import org.springframework.mail.javamail.JavaMailSender; import org.springframework.stereotype.Service;
@Service
public class EmailService {
    private final JavaMailSender mailSender; private final String username;
    public EmailService(JavaMailSender mailSender,@Value("${spring.mail.username:}") String username){this.mailSender=mailSender;this.username=username;}
    public void send(String to,String subject,String text){
        if(username==null || username.isBlank()) return;
        SimpleMailMessage mail=new SimpleMailMessage(); mail.setFrom(username); mail.setTo(to); mail.setSubject(subject); mail.setText(text); mailSender.send(mail);
    }
}
