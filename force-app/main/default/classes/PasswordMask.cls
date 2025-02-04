public class PasswordMask Implements vlocity_cmt.VlocityOpenInterface {
     /**
    * Masks the given password with the specified mask character.
    * @param password The password to mask.
    * @param maskCharacter The character to use for masking. Defaults to '*'.
    * @param unmaskedStart Optional parameter to keep the first few characters unmasked.
    * @param unmaskedEnd Optional parameter to keep the last few characters unmasked.
    * @return The masked password.
    */
    public boolean invokeMethod(String MethodName,Map<String,Object> input,Map<String,object> output,Map<string,object> options){
        if(MethodName == 'maskPassword'){
          maskPassword((string)input.get('PassCode'),'*'); 
        }  
     return true;   
    }
   public Map<string,Object>  maskPassword(String password, String maskCharacter) {
       Map<string,Object> retrunMap = new Map<string,Object>();
       if (String.isEmpty(password)) return null;
       // Set default mask character if not provided
       maskCharacter = String.isEmpty(maskCharacter) ? '*' : maskCharacter;
       Integer length = password.length();
       String maskedPassword = '';
       // Determine how many characters to leave unmasked at the start and end
      Integer unmaskedStart = Integer.valueof((Math.random() * 10));
      Integer unmaskedEnd = Integer.valueof((Math.random() * 10));
       // Build masked password
       for (Integer i = 0; i < length; i++) {
           maskedPassword += (i == unmaskedStart || i == length - unmaskedEnd)
               ? password.substring(i, i + 1)
               : maskCharacter;
       }
       retrunMap.put('Password',maskedPassword);
       return retrunMap;
   }
    
    
}