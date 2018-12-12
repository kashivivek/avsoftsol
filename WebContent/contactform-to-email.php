<?php

$name = $_POST['name'];
$visitor_email = $_POST['email'];
$message = $_POST['message'];

$email_from = "$visitor_email";//<== update the email address
$email_subject = "Contact us request from $name";
$sucessMessage = "Your Request has been submitted";
$email_body = "Hi Team, \n \nYou have received a new message from the user $name. \n".
		"Here is the message:\n $message \n \n Thanks,\n CyberForza Team.";

$to = "kashivivek@gmail.com";//<== update the email address
$headers = "From: $email_from \r\n";
$headers .= "Reply-To: $visitor_email \r\n";
//Send the email!
mail($to,$email_subject,$email_body,$headers);
//done. redirect to thank-you page.
header('Location: index.html');

?>